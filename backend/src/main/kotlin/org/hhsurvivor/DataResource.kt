package org.hhsurvivor

import com.codahale.metrics.annotation.Timed
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.w3c.dom.Document
import org.w3c.dom.NodeList
import org.xml.sax.InputSource
import java.io.File
import java.io.StringReader
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.*
import javax.ws.rs.*
import javax.ws.rs.core.MediaType
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.xpath.XPathConstants
import javax.xml.xpath.XPathFactory

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
class DataResource(private val objectMapper: ObjectMapper) {

    private val log = LoggerFactory.getLogger(DataResource::class.java)
    private data class PickNumberKey(val playerId: String, val gameId: String)
    private val pickNumberMap = HashMap<PickNumberKey, Int>()

    @Timed
    @GET
    @Path("/weeks")
    fun getWeeks(): List<Week> {
        val gamess = ArrayList<ArrayList<Game>>();
        for (i in 1..17) {
            gamess.add(ArrayList())
        }
        for (game in Data.games.values) {
            gamess[game.week-1].add(game)
        }
        val retval = ArrayList<Week>()
        for (i in 1..17) {
            retval.add(Week(i, gamess[i-1]))
        }
        return retval
    }

    @Timed
    @GET
    @Path("/currentWeek")
    fun getCurrentWeek(): Int {
        val currentDate = LocalDate.now(ZoneId.of("America/Los_Angeles"))
        for (weekNumber in 1..17) {
            val doc = readXml("data/week_$weekNumber.xml")

            val xpFactory = XPathFactory.newInstance()
            val xPathEng = xpFactory.newXPath()
            val xPath = "//g"
            val res = xPathEng.evaluate(xPath, doc, XPathConstants.NODESET) as NodeList

            try {
                val eid = res.item(0).attributes.getNamedItem("eid").textContent
                val gameDateStr = eid.substring(0, eid.length - 2)
                val gameDate = LocalDate.parse(gameDateStr, DateTimeFormatter.ofPattern("yyyyMMdd"))
                if (gameDate > currentDate) {
                    return weekNumber
                }
            } catch (e: Exception) {
                val gameId = res.item(0).attributes.getNamedItem("eid").textContent
                Data.log.warn("Weird XML entry, couldn't evaluated completed game $gameId for its record.", e)
                return 1
            }
        }
        return 17
    }

    @Timed
    @GET
    @Path("/player")
    fun getPlayer(@QueryParam("id") playerId: String): Player {
        val playerFile = File("data/players/$playerId.json")
        if (playerFile.isFile) {
            try {
                return objectMapper.readValue(playerFile, Player::class.java)
            } catch (e: Exception) {
                log.error("couldn't read player file $playerId.json", e)
            }
        }
        return Player("🐌", "🐌", "Unknown", listOf())
    }

    @Timed
    @GET
    @Path("/records")
    fun getRecords(): List<TeamRecord> {
        return Data.records.map { entry -> TeamRecord(entry.key, entry.value.wins, entry.value.losses, entry.value.ties) }
    }

    @Timed
    @Path("/pick")
    @POST
    fun pickGame(body: PlayerPick) {
        val lastRelatedPick = pickNumberMap[PickNumberKey(body.playerId, body.gameId)]
        if (lastRelatedPick != null && lastRelatedPick > body.pickNumber) {
            return;
        }
        val game = Data.games[body.gameId]
        if (game != null && game.week < getCurrentWeek()) {
            return;
        }
        val playerFile = File("data/players/${body.playerId}.json")
        if (playerFile.isFile) {
            try {
                val oldPlayer = objectMapper.readValue(playerFile, Player::class.java)
                val newPicks = oldPlayer.picks.filter({ x -> x.gameId != body.gameId }).toMutableList()
                if (!oldPlayer.picks.contains(Pick(body.gameId, body.week, body.pick))) {
                    newPicks.add(Pick(body.gameId, body.week, body.pick))
                }
                val newPlayer = Player(oldPlayer.id, oldPlayer.historyId, oldPlayer.name, newPicks)
                objectMapper.writeValue(playerFile, newPlayer)
            } catch (e: Exception) {
                log.error("couldn't read or write player file ${body.playerId}.json", e)
            }
        }

        pickNumberMap[PickNumberKey(body.playerId, body.gameId)] = body.pickNumber
    }

    @Timed
    @Path("/scoreboard")
    @GET
    fun getScoreboard(): List<PlayerScore> {
        val retval = ArrayList<PlayerScore>();
        for (file in File("data/players/").walk()) {
            if (!file.isFile || file.extension != "json") {
                continue;
            }
            val player = objectMapper.readValue(file, Player::class.java)
            val weekWins = IntArray(17)
            val weekLosses = IntArray(17)
            for (pick in player.picks) {
                val game = Data.games[pick.gameId]
                if (game == null || !game.finished || game.homeScore == null || game.visitorScore == null) {
                    continue
                }
                if (game.homeScore > game.visitorScore && pick.pick == game.home
                    || game.homeScore < game.visitorScore && pick.pick == game.visitor) {
                    weekWins[pick.week-1] += 1;
                } else {
                    weekLosses[pick.week-1] += 1;
                }
            }

            var score = 0;
            for (i in 0 until weekWins.size) {
                if (weekLosses[i] == 0) {
                    score += weekWins[i]
                }
            }

            retval.add(PlayerScore(player.name, player.historyId, score))
        }
        return retval;
    }

    @Timed
    @Path("/history")
    @GET
    fun getHistory(@QueryParam("id") historyId: String): Player {
        for (file in File("data/players/").walk()) {
            if (!file.isFile || file.extension != "json") {
                continue;
            }
            val player = objectMapper.readValue(file, Player::class.java)
            if (player.historyId == historyId) {
                val picks = player.picks.filter { pick -> pick.week < this.getCurrentWeek() }
                return Player("🐌", player.historyId, player.name, picks)
            }
        }
        return Player("🐌", "🐌", "Unknown", listOf())
    }
}

fun readXml(path: String): Document {
    val xmlFile = File(path)
    val dbFactory = DocumentBuilderFactory.newInstance()
    val dBuilder = dbFactory.newDocumentBuilder()
    val xmlInput = InputSource(StringReader(xmlFile.readText()))
    return dBuilder.parse(xmlInput)
}

