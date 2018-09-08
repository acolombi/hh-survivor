package org.hhsurvivor

data class Game(val home: String, val away: String, val datetime: String)

data class Week(val number: Int, val games: List<Game>)