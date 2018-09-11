package org.hhsurvivor

import com.codahale.metrics.annotation.Timed
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.w3c.dom.Document
import org.w3c.dom.NodeList
import org.xml.sax.InputSource
import java.io.File
import java.io.StringReader
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.Produces
import javax.ws.rs.QueryParam
import javax.ws.rs.core.MediaType
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.xpath.XPathConstants
import javax.xml.xpath.XPathFactory


@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
class DataResource(private val objectMapper: ObjectMapper) {

    private val log = LoggerFactory.getLogger(DataResource::class.java)

    @Timed
    @GET
    @Path("/weeks")
    fun getWeeks(): List<Week> {
        val retval = ArrayList<Week>();
        for (i in 1..17) {
            val doc = readXml("data/week_$i.xml")
            val games = extractGames(doc)
            retval.add(Week(i, games))
        }
        return retval
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
        return Player("🐌", "Unknown", listOf())
    }

    @Timed
    @GET
    @Path("/records")
    fun getRecords(): List<TeamRecord> {
        return Data.records.map { entry -> TeamRecord(entry.key, entry.value.wins, entry.value.losses, entry.value.ties) }
    }
}

fun readXml(path: String): Document {
    val xmlFile = File(path)
    val dbFactory = DocumentBuilderFactory.newInstance()
    val dBuilder = dbFactory.newDocumentBuilder()
    val xmlInput = InputSource(StringReader(xmlFile.readText()))
    return dBuilder.parse(xmlInput)
}

private fun extractGames(doc: Document): List<Game> {
    val xpFactory = XPathFactory.newInstance()
    val xPathEng = xpFactory.newXPath()
    val xPath = "//g"
    val res = xPathEng.evaluate(xPath, doc, XPathConstants.NODESET) as NodeList

    val retval = ArrayList<Game>()
    for (i in 0 until res.length) {
        val id = res.item(i).attributes.getNamedItem("gsis").textContent
        val home = res.item(i).attributes.getNamedItem("h").textContent
        val homeScore = stringToInt(res.item(i).attributes.getNamedItem("hs").textContent)
        val visitor = res.item(i).attributes.getNamedItem("v").textContent
        val visitorScore = stringToInt(res.item(i).attributes.getNamedItem("vs").textContent)
        val time = res.item(i).attributes.getNamedItem("d").textContent + " " +
                estToPst(res.item(i).attributes.getNamedItem("t").textContent)
        val finished = res.item(i).attributes.getNamedItem("q").textContent.startsWith("F")
        retval.add(Game(id, home, homeScore, visitor, visitorScore, time, finished))
    }

    return retval;
}

private fun stringToInt(str: String?): Int? {
    return if (str != "") str?.toInt() else null;
}

private fun estToPst(estTime: String): String {
    val parseFormat = DateTimeFormatter.ofPattern("h:mm a")
    val printFormat = DateTimeFormatter.ofPattern("h:mm")
    return LocalTime.parse("$estTime AM", parseFormat).minusHours(3).format(printFormat);
}