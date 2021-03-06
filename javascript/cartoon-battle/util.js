define(['cartoon-battle/config', 'cartoon-battle/Rarity'], function (config, Rarity) {

    if (typeof Object.assign != 'function') {
        Object.assign = function(target, varArgs) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    if (typeof Object.create != 'function') {
        Object.create = (function(undefined) {
            var Temp = function() {};
            return function (prototype, propertiesObject) {
                if(prototype !== null && prototype !== Object(prototype)) {
                    throw TypeError('Argument must be an object, or null');
                }
                Temp.prototype = prototype || {};
                var result = new Temp();
                Temp.prototype = null;
                if (propertiesObject !== undefined) {
                    Object.defineProperties(result, propertiesObject);
                }

                // to imitate the case of Object.create(null)
                if(prototype === null) {
                    result.__proto__ = null;
                }
                return result;
            };
        })();
    }

    function make_api_call(message, params, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://cb-live.synapse-games.com/api.php?message=' + message);
        xhr.onload = function () {
            cb && cb(JSON.parse(xhr.responseText));
        };
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        params = Object.assign(params, {
            user_id: params.user_id || 7232069,
            password: params.password || '1027fd20001a5e38de00a7d35c257c58'
        });

        xhr.send(Object.keys(params).map(function (name) {
            return name + '=' + encodeURIComponent(params[name])
        }).join('&'));
    }

    function get_user_info(user_id, cb, credentials) {
        credentials = credentials || window.localStorage || {};

        make_api_call('getUserProfile', {
            "target_user_id": user_id,
            "user_id": credentials.user_id,
            "password": credentials.password
        }, cb);
    }

    function object_to_array(object) {
        return object ? Object.keys(object).map(function (key) {
            return object[key];
        }) : [];
    }

    function util__slugify(name) {
        return name.replace(/[^\d\w -]/g, '').replace(/ /g, '-').toLowerCase();
    }


    function rarities__filter(rarities) {
        return function (card) {
            return 0 === rarities.length || !!~rarities.indexOf(config.rarities[card.rarity-1]);
        }
    }

  function compress(c){var x='charCodeAt',b,e={},f=c.split(""),d=[],a=f[0],g=256;for(b=1;b<f.length;b++)c=f[b],null!=e[a+c]?a+=c:(d.push(1<a.length?e[a]:a[x](0)),e[a+c]=g,g++,a=c);d.push(1<a.length?e[a]:a[x](0));for(b=0;b<d.length;b++)d[b]=String.fromCharCode(d[b]);return d.join("")}

  function decompress(b){var a,e={},d=b.split(""),c=f=d[0],g=[c],h=o=256;for(b=1;b<d.length;b++)a=d[b].charCodeAt(0),a=h>a?d[b]:e[a]?e[a]:f+c,g.push(a),c=a.charAt(0),e[o]=f+c,o++,f=a;return g.join("")}


  return {
        "slugify": util__slugify,

        "get_user_info": get_user_info,
        "make_api_call": make_api_call,
        "compress": compress,
        'decompress': decompress,

        "object_to_array": object_to_array,

        "card_with_level_re": /^\s*(.+?)(?:\s+((\d+|\^)\s*[*]{0,2}))?\s*$/,

        "rarities_filter": rarities__filter,

        "clone": function util__clone(obj) {
            if (null == obj || "object" !== typeof obj) return obj;
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = util__clone(obj[attr]);
            }
            return copy;
        },

        "cleanElement": function util__cleanElement(e) {
            while (e && e.firstChild) {
                e.removeChild(e.firstChild)
            }

            return e;
        },

        "createFragment": function util__createFragment(name, children) {
            var element = document.createElement(name);
            for (var i = 0, cn; cn = children[i]; i++) {
                element.appendChild(
                    2 === cn.length ? util__createFragment(cn[0], cn[1]) : document.createElement(cn)
                )
            }

            return element;
        },

        "rarityCounter": function util__rarityCounter(data) {
            return [1,2,3,4].map(function (key) {
                return {
                    rarity: new Rarity(key),
                    count: data[key] || 0
                }
            }).reduce(function (div, item) {
                div.className = 'btn-group btn-counter';

                var img = document.createElement('img');
                img.src = config.images_cdn + "icons/rarityicon_" + item.rarity.name + ".png";
                img.alt = item.rarity.name;

                var button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.className = 'btn btn-default';

                button.appendChild(document.createTextNode(item.count + ' '));
                button.appendChild(img);

                div.appendChild(button);

                return div;

            }, document.createElement('div'));
        },

        "createTable": function util__createTable(data, keys) {
            if (!data.length) {
                return ;
            }

            function row(data, type) {
                return data.map(function (name) {
                    var element = document.createElement(type || 'td');

                    if ('TH' === element.nodeName && "string" === typeof name) {
                        element.className = util__slugify(name);
                    }

                    return element.appendChild(
                        "function" === typeof name ? name() : document.createTextNode(name)
                    ).parentNode;
                }).reduce(function (tr, node) {
                    return tr.appendChild(node).parentNode;
                }, document.createElement('tr'));
            }

            keys = keys || Object.keys(data[0]);

            var table = document.createElement('table');
            table.className = 'table table-striped';


            table.appendChild(document.createElement('thead').appendChild(row(keys, 'th')).parentNode);

            return data.reduce(function (tbody, item) {
                return tbody.appendChild(row(Object.keys(item).map(function (k) { return item[k]; }))).parentNode;
            }, table.appendChild(document.createElement('tbody'))).parentNode;
        }
    }
});
