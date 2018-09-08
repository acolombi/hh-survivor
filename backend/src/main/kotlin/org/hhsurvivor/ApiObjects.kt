package org.hhsurvivor

data class Game(val home: String, val homeScore: Int?, val visitor: String, val visitorScore: Int?, val datetime: String)

data class Week(val number: Int, val games: List<Game>)