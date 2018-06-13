/*global $*/
/*jslint unparam: true*/
/*

    Eternal Power Calculator
    Copyright (C) 2018  Matt Kimball

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

*/

'use strict';


/*
    Construct an object which can generate HTML tables with odds of
    drawing cards from a deck.

    We need a text list of all possible cards to get started.
*/
function generateOddsTable(
    tableDiv,
    powerSourcesDiv,
    validationDiv,
    cardLibrary,
    deck
) {
    var minDraws, maxDraws, iconSize;

    minDraws = 7;
    maxDraws = 17;
    iconSize = 20;

    /*  Append an influence icon to the influence cell of the table  */
    function appendInfluenceImage(
        cell,
        imageFile
    ) {
        $("<img>").addClass("influence-icon")
            .attr("src", imageFile)
            .attr("width", iconSize)
            .attr("height", iconSize)
            .appendTo(cell);
    }

    /*
        Add the text and icons representing an influence requirement
        to a table cell
    */
    function addInfluenceDisplay(
        cell,
        influence
    ) {
        var i;

        if (influence.power > 0) {
            cell.text(String(influence.power));
        }

        for (i = 0; i < influence.fire; i += 1) {
            appendInfluenceImage(cell, "icon-fire.png");
        }

        for (i = 0; i < influence.time; i += 1) {
            appendInfluenceImage(cell, "icon-time.png");
        }

        for (i = 0; i < influence.justice; i += 1) {
            appendInfluenceImage(cell, "icon-justice.png");
        }

        for (i = 0; i < influence.primal; i += 1) {
            appendInfluenceImage(cell, "icon-primal.png");
        }

        for (i = 0; i < influence.shadow; i += 1) {
            appendInfluenceImage(cell, "icon-shadow.png");
        }
    }

    /*
        Compute the odds for each draw count in the range, 
        for each influence requirement from the deck, and 
        fill out the table with those values.
    */
    function generateTableRows(
        table,
        deck
    ) {
        var drawCount, text, row, influenceCards;

        influenceCards = deck.listInfluenceRequirements();

        row = $("<tr>").addClass("power-table-row-head").appendTo(table);
        $("<th>").addClass("power-table-head-draws").
            text("Draws").appendTo(row);

        /*  Add the heading cells  */
        for (drawCount = minDraws;
                drawCount <= maxDraws;
                drawCount += 1) {

            if (drawCount === minDraws) {
                text = "-";
            } else {
                text = "+" + String(drawCount - minDraws);
            }

            $("<th>").addClass("power-table-head-draw-count").
                text(text).appendTo(row);
        }

        /*  Add the body cells  */
        $.each(influenceCards, function (index, influenceCard) {
            var odds, oddsText, influence, cardList, cardPower, th, td;

            influence = influenceCard[0];
            cardList = influenceCard[1];
            cardPower = cardList[0].influenceRequirements[0].power;

            row = $("<tr>").addClass("power-table-row-body").appendTo(table);
            th = $("<th>").addClass("power-table-influence").appendTo(row);
            addInfluenceDisplay(th, influence);

            for (drawCount = minDraws;
                    drawCount <= maxDraws;
                    drawCount += 1) {

                odds = 0;
                odds = deck.drawOdds(drawCount, influence);
                oddsText = Math.floor(odds * 100) + "%";
                td = $("<td>").addClass("power-table-odds").
                    text(oddsText).appendTo(row);

                /*
                    Darken the cells where we typically won't have enough
                    draws for the power requirements.
                */
                if (drawCount - minDraws + 1 < cardPower) {
                    td.addClass("power-table-odds-shaded");
                }
            }
        });
    }

    /*
        Generate the list of power and influence sources used for
        computing odds.
    */
    function generatePowerSourceText(
        deck
    ) {
        var div, text;

        div = powerSourcesDiv;
        div.empty();

        text = "";
        $.each(deck.listPowerInfluenceSources(), function (index, card) {
            var name;

            name = deck.cardNames[card.id];

            if (index > 0) {
                text = text + ", ";
            }

            /*  Replace spaces with non-breaking spaces  */
            text = text + name.replace(/ /g, "\u00A0");
        });

        div.append("Power and influence sources:");
        $("<br>").appendTo(div);
        div.append(text);
    }

    /*
        Generate the odds table from a new decklist.
        Report the status of the table generation in the
        'validationDiv' region.
    */
    function generateTable() {
        var table, validText;

        if (cardLibrary.makeError) {
            return;
        }

        if (deck.makeError) {
            return;
        }

        table = $("<table>").addClass("power-table");
        generateTableRows(table, deck);
        generatePowerSourceText(deck);

        tableDiv.empty();
        tableDiv.append(table);

        validText = deck.cards.length + " cards";
        validationDiv
            .text(validText)
            .attr("class", "validation-success");
    }

    generateTable();
}
