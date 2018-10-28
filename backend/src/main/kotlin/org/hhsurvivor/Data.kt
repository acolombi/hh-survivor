package org.hhsurvivor

import org.slf4j.LoggerFactory
import org.w3c.dom.NodeList
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import javax.xml.xpath.XPathConstants
import javax.xml.xpath.XPathFactory

data class Record(var wins: Int, var losses: Int, var ties: Int)

object Data {
    val teams = listOf("ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN", "DET", "GB", "HOU", "IND",
            "JAX", "KC", "LA", "LAC", "MIA", "MIN", "NE", "NO", "NYG", "NYJ", "OAK", "PHI", "PIT", "SF", "SEA", "TB",
            "TEN", "WAS")

    val records = HashMap<String, Record>()
    val games = LinkedHashMap<String, Game>()
    val log = LoggerFactory.getLogger(Data::class.java)

    init {
        for (team in teams) {
            records[team] = Record(0, 0, 0)
        }
    }

    fun updateGames() {
        games.clear()
        for (weekNumber in 1..17) {
            val doc = readXml("data/week_$weekNumber.xml")

            val xpFactory = XPathFactory.newInstance()
            val xPathEng = xpFactory.newXPath()
            val xPath = "//g"
            val res = xPathEng.evaluate(xPath, doc, XPathConstants.NODESET) as NodeList

            for (i in 0 until res.length) {

                val eid = res.item(i).attributes.getNamedItem("eid").textContent
                val home = res.item(i).attributes.getNamedItem("h").textContent
                val homeScore = stringToInt(res.item(i).attributes.getNamedItem("hs").textContent)
                val visitor = res.item(i).attributes.getNamedItem("v").textContent
                val visitorScore = stringToInt(res.item(i).attributes.getNamedItem("vs").textContent)
                val estTime = timeStringToEst(eid, res.item(i).attributes.getNamedItem("t").textContent)
                val dayTime = res.item(i).attributes.getNamedItem("d").textContent + " " +
                        estToPstString(estTime)
                val finished = res.item(i).attributes.getNamedItem("q").textContent.startsWith("F")
                val datetime = gameDateTime(eid, estTime);
                games[eid] = Game(eid, weekNumber, home, homeScore, visitor, visitorScore, dayTime, datetime, finished)
            }
        }
    }

    fun updateRecords() {
        for (team in teams) {
            records[team] = Record(0, 0, 0)
        }
        for (game in games.values) {
            val visitorScore = game.visitorScore
            val homeScore = game.homeScore
            if (!game.finished || homeScore == null || visitorScore == null) {
                continue
            }

            if (visitorScore < homeScore) {
                this.records[game.home]!!.wins += 1
                this.records[game.visitor]!!.losses += 1
            } else if (visitorScore > homeScore) {
                this.records[game.visitor]!!.wins += 1
                this.records[game.home]!!.losses += 1
            } else {
                this.records[game.visitor]!!.ties += 1
                this.records[game.home]!!.ties += 1
            }
        }
    }
}

private fun timeStringToEst(eid: String, timeString: String): LocalTime {
    val parseFormat = DateTimeFormatter.ofPattern("h:mm a")
    val amGames = setOf("2018102800", "2018102100")
    val ampm = if (amGames.contains(eid)) "AM" else "PM"
    return LocalTime.parse("$timeString $ampm", parseFormat)
}

private fun estToPstString(estTime: LocalTime): String {
    val printFormat = DateTimeFormatter.ofPattern("h:mm")
    return estTime.minusHours(3).format(printFormat)
}

private fun stringToInt(str: String?): Int? {
    return if (str != "") str?.toInt() else null;
}

private fun gameDateTime(eid: String, time: LocalTime): ZonedDateTime {
    val gameDateStr = eid.substring(0, eid.length - 2)
    val localDate = LocalDate.parse(gameDateStr, DateTimeFormatter.ofPattern("yyyyMMdd"))
    return ZonedDateTime.of(localDate, time, ZoneId.of("America/New_York"))
}