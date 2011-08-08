/**
 * ASCIIMath Plugin for TinyMCE editor
 *   port of ASCIIMath plugin for HTMLArea written by 
 *   David Lippman & Peter Jipsen
 *
 * @author David Lippman
 * @copyright Copyright © 2008 David Lippman.
 *
 * Plugin format based on code that is:
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
    // Load plugin specific language pack
    tinymce.PluginManager.requireLangPack('asciimath');

    tinymce.create('tinymce.plugins.AsciimathPlugin', {
        /**
         * Initializes the plugin, this will be executed after the
         * plugin has been created.This call is done before the editor
         * instance has finished it's initialization so use the onInit
         * event of the editor instance to intercept that event.
         * @param {tinymce.Editor} ed Editor instance that the plugin is
         * initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed, url) {
            var t = this;

            ed.addCommand('mceAsciimath', function(val) {

                var el = ed.dom.create('span', {'class' : 'AM'}, val);
                t.ascii2mathml(el);
                ed.selection.setNode(el);
                
            });

            ed.addCommand('mceAsciimathCharmap', function() {
                if (typeof AMTcgiloc == 'undefined') {
                    AMTcgiloc = ""; 
                }
                ed.windowManager.open({
                    file : url + '/amcharmap',
                    width : 630 + parseInt(
                        ed.getLang('asciimathdlg.delta_width', 0)),
                    height : 390 + parseInt(
                        ed.getLang('asciimathdlg.delta_height', 0)),
                    inline : 1
                }, {
                    plugin_url : url, // Plugin absolute URL
                    AMTcgiloc : AMTcgiloc
                });
                
            });

            ed.addCommand('mceAsciimathPopup', function() {
				var el = ed.selection.getNode();
				var spanAM = ed.dom.getParent(el, 'span.AM');
                var asciimath = "";

                if (spanAM) {
                    mathml = spanAM.cloneNode(true);
                    t.math2ascii(mathml); 
                    asciimath = mathml.innerHTML.slice(1,-1);
                }

                ed.windowManager.open({
                    file : url + '/ampopup.htm',
                    width : 630 + parseInt(
                        ed.getLang('asciimathdlg.delta_width', 0)),
                    height : 390 + parseInt(
                        ed.getLang('asciimathdlg.delta_height', 0)),
                    inline : 1
                }, {
                    plugin_url : url, // Plugin absolute URL
                    asciimath: asciimath,
                });
                
            });

            // Add a node change handler, selects the button in the UI
            // when mathml is selected
			ed.onNodeChange.add(function(ed, cm, n) {
                selected = ed.dom.select('math.mceItemVisualAid');
                for (var i=0; i < selected.length; i++) {
                    math = selected[i];
                    math.removeAttribute('class');
                };
				var AMspan = ed.dom.getParent(n, 'span.AM');
				cm.setActive('asciimath', AMspan != null);
                if (AMspan) {
                    math = AMspan.getElementsByTagName('math')[0];
                    // force selection of the math element since
                    // selection of child elements causes an exception when
                    // TinyMCE tries access the style attribute on those
                    // MathML elements
                    ed.selection.select(math);
                    ed.selection.collapse(true);
                    // highlight the math element
                    if (AMspan.getElementsByClassName('mceItemVisualAid')) {
                        if (math != null) {
                            // not sure why ed.dom.addClass does not work
                            // ed.dom.addClass(math, 'mceItemVisualAid');
                            math.setAttribute('class', 'mceItemVisualAid');
                        }
                    };

                }
			});

            // Register asciimath button
            ed.addButton('asciimath', {
                title : 'asciimath.desc',
                cmd : 'mceAsciimathPopup',
                image : url + '/img/ed_mathformula2.gif'
            });


            ed.addButton('asciimathcharmap', {
                title : 'asciimathcharmap.desc',
                cmd : 'mceAsciimathCharmap',
                image : url + '/img/ed_mathformula.gif'
            });

            ed.onPreInit.add(function(ed) {
                if (tinymce.isIE) {
                    addhtml = "<object id=\"mathplayer\" classid=\"clsid:32F66A20-7614-11D4-BD11-00104BD3F987\"></object>";
                    addhtml +="<?import namespace=\"m\" implementation=\"#mathplayer\"?>";
            
                    ed.dom.doc.getElementsByTagName("head")[0].insertAdjacentHTML("beforeEnd",addhtml);
                }
                
            });

            ed.onPreProcess.add(function(ed,o) {
                if (o.get) {
                    AMtags = ed.dom.select('span.AM', o.node);
                    for (var i=0; i<AMtags.length; i++) {
                        t.math2ascii(AMtags[i]); 
                    }
                    AMtags = ed.dom.select('span.AMedit', o.node);
                    for (var i=0; i<AMtags.length; i++) {
                        var myAM = AMtags[i].innerHTML;
                        myAM = "`"+myAM.replace(/\`/g,"")+"`";
                        AMtags[i].innerHTML = myAM;
                        AMtags[i].className = "AM";
                    }
                } 
            });

            ed.onBeforeGetContent.add(function(ed,cmd) {
                AMtags = ed.dom.select('span.AM');
                for (var i=0; i<AMtags.length; i++) {
                    t.math2ascii(AMtags[i]);
                    AMtags[i].className = "AMedit";
                }
            });

            ed.onGetContent.add(function(ed,cmd) {
                AMtags = ed.dom.select('span.AMedit');
                for (var i=0; i<AMtags.length; i++) {
                    t.ascii2mathml(AMtags[i]);
                    AMtags[i].className = "AM";
                }
            });

            ed.onExecCommand.add(function(ed,cmd) {
                if (cmd == 'mceRepaint') {
                    AMtags = ed.dom.select('span.AM');
                    for (var i=0; i<AMtags.length; i++) {
                        t.ascii2mathml(AMtags[i]);
                    }
                }
            });

            ed.onDeactivate.add(function(ed) {
                if (t.lastAMnode != null) {
                     if (t.lastAMnode.innerHTML.match(/`(&nbsp;|\s)*`/)|| t.lastAMnode.innerHTML.match(/^(&nbsp;|\s|\u00a0|&#160;)*$/)) {
                         p = t.lastAMnode.parentNode;
                         p.removeChild(t.lastAMnode);
                     } else {
                         t.ascii2mathml(t.lastAMnode);  
                         t.lastAMnode.className = 'AM'; 
                     }
                     t.lastAMnode = null;
                }
            });

        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and
         * version.
         *
         * @return {Object} Name/value array containing information
         * about the plugin.
         */

        getInfo : function() {
            return {
                longname : 'Asciimath plugin',
                author : 'David Lippman',
                authorurl : 'http://www.pierce.ctc.edu/dlippman',
                infourl : '',
                version : "1.0"
            };
        },

        math2ascii : function(el) {
            var myAM = el.innerHTML;
            if (myAM.indexOf("`") == -1) {
                myAM = myAM.replace(/.+(alt|title)=\"(.*?)\".+/g,"$2");
                myAM = myAM.replace(/.+(alt|title)=\'(.*?)\'.+/g,"$2");
                myAM = myAM.replace(/.+(alt|title)=([^>]*?)\s.*>.*/g,"$2");
                myAM = myAM.replace(/.+(alt|title)=(.*?)>.*/g,"$2");
                //myAM = myAM.replace(/&gt;/g,">");
                //myAM = myAM.replace(/&lt;/g,"<");
                myAM = myAM.replace(/>/g,"&gt;");
                myAM = myAM.replace(/</g,"&lt;");
                myAM = "`"+myAM.replace(/\`/g,"")+"`";
                el.innerHTML = myAM;
            }
        },

        ascii2mathml : function(outnode) {
            
            if (tinymce.isIE) {
                  var str = outnode.innerHTML.replace(/\`/g,"");
                  str.replace(/\"/,"&quot;");
                  var newAM = document.createElement("span");
                  newAM.appendChild(AMparseMath(str));
                  outnode.innerHTML = newAM.innerHTML;    
              } else {
                  // doesn't work on IE, probably because this script is
                  // in the parent
                  // windows, and the node is in the iframe.  Should it
                  // work in Moz?

                 // next 2 lines needed to make caret
                 var myAM = "`"+outnode.innerHTML.replace(/\`/g,"")+"`"; 

                 // move between `` on Firefox insert math
                 outnode.innerHTML = myAM;     
                 AMprocessNode(outnode);
              }
            
        }, 

        lastAMnode : null,
        preventAMrender : false,

        testAMclass : function(el) {
            if ((el.className == 'AM') || (el.className == 'AMedit')) {
                return true;
            } else {
                return false;
            }
        }
    });

    // Register plugin
    tinymce.PluginManager.add('asciimath', tinymce.plugins.AsciimathPlugin);
})();
