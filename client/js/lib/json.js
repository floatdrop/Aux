/* global _ */

/** @license
 * RequireJS plugin for loading JSON files
 * - depends on Text plugin and it was HEAVILY "inspired" by it as well.
 * Author: Miller Medeiros
 * Version: 0.3.1 (2013/02/04)
 * Released under the MIT license
 */
define(['./text'], function (text) {

    var CACHE_BUST_QUERY_PARAM = 'bust',
        jsonParse = (typeof JSON !== 'undefined' && typeof JSON.parse === 'function') ? JSON.parse : function (val) {
            return eval('(' + val + ')'); //quick and dirty
        },
        buildMap = {};

    function addParameters(json, name) {
            var parameters = name.substr(name.indexOf('?') + 1);
            _.each(parameters.split(','), function (param) {
                var splits = param.split('=');
                json[splits[0]] = splits[1];
            });
            return json;
        }

    //API
    return {

        load : function (name, req, onLoad, config) {
            if (config.isBuild && (config.inlineJSON === false || name.indexOf(CACHE_BUST_QUERY_PARAM + '=') !== -1)) {
                //avoid inlining cache busted JSON or if inlineJSON:false
                onLoad(null);
            } else {
                text.get(req.toUrl(name), function (data) {
                    if (config.isBuild) {
                        buildMap[name] = data;
                        onLoad(data);
                    } else {
                        var json = jsonParse(data);
                        onLoad(addParameters(json, name));
                    }
                },
                    onLoad.error, {
                        accept: 'application/json'
                    }
                );
            }
        },

        //write method based on RequireJS official text plugin by James Burke
        //https://github.com/jrburke/requirejs/blob/master/text.js
        write : function (pluginName, moduleName, write) {
            if (moduleName in buildMap) {
                var content = buildMap[moduleName];
                write('define("' + pluginName + '!' + moduleName + '", function(){ return ' + content + ';});\n');
            }
        }

    };
});