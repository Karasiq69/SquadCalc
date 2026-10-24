import { App } from "../app.js";
import { MAPS } from "../data/maps.js";
import SquadServersBrowser from "./squadServersBrowser.js";

// "RGF_LO_Motorized" -> "RGF"
const factionOf = (unit) => unit?.split("_")[0];

/**
 * Switches map, layer, factions and units to what is currently played on a KrestGG server.
 * Data comes from endback server-info, proxied by nginx under /krest-api/.
 * @param {string} serverId - endback server id (1 AAS, 2 INV, 3 MINI, 4 RAAS)
 */
export async function openKrestServer(serverId) {
    try {
        const response = await fetch(`/krest-api/${serverId}/server-info`);
        if (!response.ok) throw new Error(`server-info responded ${response.status}`);
        const { serverName, currentLayer, teamOne, teamTwo } = await response.json();

        const mapName = currentLayer.split("_")[0];
        if (!MAPS.some(map => map.name.toLowerCase() === mapName.toLowerCase())) {
            throw new Error(`Unknown map for layer ${currentLayer}`);
        }

        // Leave server-browser sync mode, otherwise it switches the layer back on its next tick
        if (App.SERVER_SELECTOR.val()) App.SERVER_SELECTOR.val("").trigger("change");

        const browser = App.squadServersBrowser ?? new SquadServersBrowser();
        browser.switchLayer(serverName, mapName, currentLayer, factionOf(teamOne), factionOf(teamTwo), teamOne, teamTwo);
    } catch (error) {
        console.error("Error loading KrestGG server layer:", error);
        App.openToast("error", "error", "apiError");
    }
}
