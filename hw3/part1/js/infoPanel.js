/** Class implementing the infoPanel view. */
class InfoPanel {
    /**
     * Creates a infoPanel Object
     */
    constructor() {
    }

    /**
     * Update the info panel to show info about the currently selected world cup
     * @param oneWorldCup the currently selected world cup
     */
    updateInfo(oneWorldCup) {

        // ******* TODO: PART III *******

        // Update the text elements in the infoBox to reflect:
        // World Cup Title, host, winner, runner_up, and all participating teams that year

        // Hint: For the list of teams, you can create an list element for each team.
        // Hint: Select the appropriate ids to update the text content.

        d3.select('#details').select('#edition')
            .text(oneWorldCup.EDITION);
        d3.select('#details').select('#host')
            .text(oneWorldCup.host);
        d3.select('#details').select('#winner')
            .text(oneWorldCup.winner);
        d3.select('#details').select('#silver')
            .text(oneWorldCup.runner_up);
        d3.select('#details').select('#teams')
            .select('ul')
            .remove();


        //Set Labels

        d3.select('#details').select('#teams')
            .append('ul').selectAll('li')
            .data(oneWorldCup.teams_names)
            .enter()
            .append('li')
            .html(String);
    }

}