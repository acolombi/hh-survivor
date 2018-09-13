package org.hhsurvivor

import org.slf4j.LoggerFactory
import org.w3c.dom.Document
import org.w3c.dom.NodeList
import javax.xml.xpath.XPathConstants
import javax.xml.xpath.XPathFactory

data class Record(var wins: Int, var losses: Int, var ties: Int)

object Data {
    val teams = listOf("ARI", "ATL", "BAL", "BUF", "CAR", "CHI", "CIN", "CLE", "DAL", "DEN", "DET", "GB", "HOU", "IND",
            "JAX", "KC", "LA", "LAC", "MIA", "MIN", "NE", "NO", "NYG", "NYJ", "OAK", "PHI", "PIT", "SF", "SEA", "TB",
            "TEN", "WAS")

    val records = HashMap<String, Record>()
    val log = LoggerFactory.getLogger(Data::class.java)

    init {
        for (team in teams) {
            records[team] = Record(0, 0, 0)
        }
    }

    fun updateRecords() {
        for (team in teams) {
            records[team] = Record(0, 0, 0)
        }

        for (i in 1..17) {
            val doc = readXml("data/week_$i.xml")

            val xpFactory = XPathFactory.newInstance()
            val xPathEng = xpFactory.newXPath()
            val xPath = "//g"
            val res = xPathEng.evaluate(xPath, doc, XPathConstants.NODESET) as NodeList

            for (i in 0 until res.length) {
                if (res.item(i).attributes.getNamedItem("q").textContent.startsWith("F")) {
                    try {
                        val home = res.item(i).attributes.getNamedItem("h").textContent
                        val homeScore = res.item(i).attributes.getNamedItem("hs").textContent.toInt()
                        val visitor = res.item(i).attributes.getNamedItem("v").textContent
                        val visitorScore = res.item(i).attributes.getNamedItem("vs").textContent.toInt()
                        if (visitorScore < homeScore) {
                            this.records[home]!!.wins += 1
                            this.records[visitor]!!.losses += 1
                        } else if (visitorScore > homeScore) {
                            this.records[visitor]!!.wins += 1
                            this.records[home]!!.losses += 1
                        } else {
                            this.records[visitor]!!.ties += 1
                            this.records[home]!!.ties += 1
                        }
                    } catch (e: Exception) {
                        val gameId = res.item(i).attributes.getNamedItem("gsis").textContent
                        log.warn("Weird XML entry, couldn't evaluated completed game $gameId for its record.", e)
                    }
                }
            }
        }
    }
}