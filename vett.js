const path = require('path');
const fs = require('fs');

exports.vett = function (filepath) {
    var out = {
        errors: [],
        signs: [],
        books: []
    };

    var files = fs.readdirSync(path.join(filepath, "overworld", "TileEntities"));
    //listing all files using forEach
    for(var file of files) {
        // Do whatever you want to do with the file
        var raw = fs.readFileSync(path.join(filepath, "overworld", "TileEntities", file), 'utf-8');
        var json;
        try {
            json = JSON.parse(raw);
        }
        catch (e) {
            event.sender.send('error', "Bad level_dat.txt. Try re-exporting your world");
        }
        var extract = json["val"];
        for (var i = 0; i < extract.length; i++) {
            if ( extract[i]['id']['val'] == "Sign" && extract[i]['Text']['val'].trim() != "" ) {
                out.signs.push({
                    text: extract[i]['Text']['val'],
                    coords: {
                        x: extract[i]['x']['val'],
                        y: extract[i]['y']['val'],
                        z: extract[i]['z']['val'],
                    }
                });
            }
        }
    }
    return out;
}