package org.hhsurvivor

data class Game(val id: String,
                val week: Int,
                val home: String,
                val homeScore: Int?,
                val visitor: String,
                val visitorScore: Int?,
                val datetime: String,
                val finished: Boolean)

data class Week(val number: Int,
                val games: List<Game>)

data class Pick(val gameId: String,
                val week: Int,
                val pick: String)

data class Player(val id: String,
                  val historyId: String,
                  val name: String,
                  val picks: List<Pick>)

data class TeamRecord(val team: String, val wins: Int, val losses: Int, val ties: Int)

data class PlayerPick(val pickNumber: Int,
                      val playerId: String,
                      val week: Int,
                      val gameId: String,
                      val pick: String)

data class PlayerScore(val playerName: String,
                       val historyId: String,
                       val score: Int)