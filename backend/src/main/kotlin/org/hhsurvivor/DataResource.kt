package org.hhsurvivor

import com.codahale.metrics.annotation.Timed
import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.Produces
import javax.ws.rs.core.MediaType

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
class DataResource {

    @Timed
    @GET
    @Path("schedule")
    fun getSchedule(): List<Week> {
        return listOf(Week(1, listOf(Game("skins", "49ers", "tues"))));
    }
}