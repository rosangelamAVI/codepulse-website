/*!
 * jQuery++ - 1.0.1
 * http://jquerypp.com
 * Copyright (c) 2014 Bitovi
 * Thu, 01 May 2014 13:47:01 GMT
 * Licensed MIT
 * Download from: http://bitbuilder.herokuapp.com/jquerypp.custom.js?plugins=jquerypp%2Fevent%2Fhover
 */
(function($) {

    // ## jquerypp/event/livehack/livehack.js
    var __m3 = (function($) {

        var event = $.event,

            //helper that finds handlers by type and calls back a function, this is basically handle
            // events - the events object
            // types - an array of event types to look for
            // callback(type, handlerFunc, selector) - a callback
            // selector - an optional selector to filter with, if there, matches by selector
            //     if null, matches anything, otherwise, matches with no selector
            findHelper = function(events, types, callback, selector) {
                var t, type, typeHandlers, all, h, handle,
                    namespaces, namespace,
                    match;
                for (t = 0; t < types.length; t++) {
                    type = types[t];
                    all = type.indexOf(".") < 0;
                    if (!all) {
                        namespaces = type.split(".");
                        type = namespaces.shift();
                        namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
                    }
                    typeHandlers = (events[type] || []).slice(0);

                    for (h = 0; h < typeHandlers.length; h++) {
                        handle = typeHandlers[h];

                        match = (all || namespace.test(handle.namespace));

                        if (match) {
                            if (selector) {
                                if (handle.selector === selector) {
                                    callback(type, handle.origHandler || handle.handler);
                                }
                            } else if (selector === null) {
                                callback(type, handle.origHandler || handle.handler, handle.selector);
                            } else if (!handle.selector) {
                                callback(type, handle.origHandler || handle.handler);

                            }
                        }


                    }
                }
            };


        event.find = function(el, types, selector) {
            var events = ($._data(el) || {}).events,
                handlers = [],
                t, liver, live;

            if (!events) {
                return handlers;
            }
            findHelper(events, types, function(type, handler) {
                handlers.push(handler);
            }, selector);
            return handlers;
        };

        event.findBySelector = function(el, types) {
            var events = $._data(el).events,
                selectors = {},
                //adds a handler for a given selector and event
                add = function(selector, event, handler) {
                    var select = selectors[selector] || (selectors[selector] = {}),
                        events = select[event] || (select[event] = []);
                    events.push(handler);
                };

            if (!events) {
                return selectors;
            }
            //first check live:

            //then check straight binds
            findHelper(events, types, function(type, handler, selector) {
                add(selector || "", type, handler);
            }, null);

            return selectors;
        };
        event.supportTouch = "ontouchend" in document;

        $.fn.respondsTo = function(events) {
            if (!this.length) {
                return false;
            } else {
                //add default ?
                return event.find(this[0], $.isArray(events) ? events : [events]).length > 0;
            }
        };
        $.fn.triggerHandled = function(event, data) {
            event = (typeof event == "string" ? $.Event(event) : event);
            this.trigger(event, data);
            return event.handled;
        };

        event.setupHelper = function(types, startingEvent, onFirst) {
            if (!onFirst) {
                onFirst = startingEvent;
                startingEvent = null;
            }
            var add = function(handleObj) {
                var bySelector,
                    selector = handleObj.selector || "",
                    namespace = handleObj.namespace ? '.' + handleObj.namespace : '';

                if (selector) {
                    bySelector = event.find(this, types, selector);
                    if (!bySelector.length) {
                        $(this).delegate(selector, startingEvent + namespace, onFirst);
                    }
                } else {
                    //var bySelector = event.find(this, types, selector);
                    if (!event.find(this, types, selector).length) {
                        event.add(this, startingEvent + namespace, onFirst, {
                                selector: selector,
                                delegate: this
                            });
                    }

                }

            },
                remove = function(handleObj) {
                    var bySelector, selector = handleObj.selector || "";
                    if (selector) {
                        bySelector = event.find(this, types, selector);
                        if (!bySelector.length) {
                            $(this).undelegate(selector, startingEvent, onFirst);
                        }
                    } else {
                        if (!event.find(this, types, selector).length) {
                            event.remove(this, startingEvent, onFirst, {
                                    selector: selector,
                                    delegate: this
                                });
                        }
                    }
                };
            $.each(types, function() {
                event.special[this] = {
                    add: add,
                    remove: remove,
                    setup: function() {},
                    teardown: function() {}
                };
            });
        };

        return $;
    })($);

    // ## jquerypp/event/hover/hover.js
    var __m1 = (function($) {

        $.Hover = function() {
            this._delay = $.Hover.delay;
            this._distance = $.Hover.distance;
            this._leave = $.Hover.leave
        };

        $.extend($.Hover, {

                delay: 100,

                distance: 10,
                leave: 0
            })


        $.extend($.Hover.prototype, {

                delay: function(delay) {
                    this._delay = delay;
                    return this;
                },

                distance: function(distance) {
                    this._distance = distance;
                    return this;
                },

                leave: function(leave) {
                    this._leave = leave;
                    return this;
                }
            })
        var event = $.event,
            handle = event.handle,
            onmouseenter = function(ev) {
                // now start checking mousemoves to update location
                var delegate = ev.delegateTarget || ev.currentTarget;
                var selector = ev.handleObj.selector;
                var pending = $.data(delegate, "_hover" + selector);
                // prevents another mouseenter until current has run its course
                if (pending) {
                    // Under some  circumstances, mouseleave may never fire
                    // (e.g., the element is removed while hovered)
                    // so if we've entered another element, wait the leave time,
                    // then force it to release.
                    if (!pending.forcing) {
                        pending.forcing = true;
                        clearTimeout(pending.leaveTimer);
                        var leaveTime = pending.leaving ?
                            Math.max(0, pending.hover.leave - (new Date() - pending.leaving)) :
                            pending.hover.leave;
                        var self = this;

                        setTimeout(function() {
                            pending.callHoverLeave();
                            onmouseenter.call(self, ev);
                        }, leaveTime);
                    }
                    return;
                }
                var loc = {
                    pageX: ev.pageX,
                    pageY: ev.pageY
                },
                    // The current distance
                    dist = 0,
                    // Timer that checks for the distance travelled
                    timer,
                    enteredEl = this,
                    // If we are hovered
                    hovered = false,
                    // The previous event
                    lastEv = ev,
                    // The $.Hover instance passed to events
                    hover = new $.Hover(),
                    // timer if hover.leave has been called
                    leaveTimer,
                    // Callback for triggering hoverleave
                    callHoverLeave = function() {
                        $.each(event.find(delegate, ["hoverleave"], selector), function() {
                            this.call(enteredEl, ev, hover)
                        })
                        cleanUp();
                    },
                    mousemove = function(ev) {
                        clearTimeout(leaveTimer);
                        // Update the distance and location
                        dist += Math.pow(ev.pageX - loc.pageX, 2) + Math.pow(ev.pageY - loc.pageY, 2);
                        loc = {
                            pageX: ev.pageX,
                            pageY: ev.pageY
                        }
                        lastEv = ev
                    },
                    mouseleave = function(ev) {
                        clearTimeout(timer);
                        if (hovered) {
                            // go right away
                            if (hover._leave === 0) {
                                callHoverLeave();
                            } else {
                                clearTimeout(leaveTimer);
                                // leave the hover after the time set in hover.leave(time)
                                pending.leaving = new Date();
                                leaveTimer = pending.leaveTimer = setTimeout(function() {
                                    callHoverLeave();
                                }, hover._leave)
                            }
                        } else {
                            cleanUp();
                        }
                    },
                    cleanUp = function() {
                        // Unbind all events and data
                        $(enteredEl).unbind("mouseleave", mouseleave)
                        $(enteredEl).unbind("mousemove", mousemove);
                        $.removeData(delegate, "_hover" + selector)
                    },
                    hoverenter = function() {
                        $.each(event.find(delegate, ["hoverenter"], selector), function() {
                            this.call(enteredEl, lastEv, hover)
                        })
                        hovered = true;
                    };
                pending = {
                    callHoverLeave: callHoverLeave,
                    hover: hover
                };
                $.data(delegate, "_hover" + selector, pending);

                // Bind the mousemove event
                $(enteredEl).bind("mousemove", mousemove).bind("mouseleave", mouseleave);
                // call hoverinit for each element with the hover instance
                $.each(event.find(delegate, ["hoverinit"], selector), function() {
                    this.call(enteredEl, ev, hover)
                })

                if (hover._delay === 0) {
                    hoverenter();
                } else {
                    timer = setTimeout(function() {
                        // check that we aren't moving around
                        if (dist < hover._distance && $(enteredEl).queue().length == 0) {
                            hoverenter();
                            return;
                        } else {
                            // Reset distance and timer
                            dist = 0;
                            timer = setTimeout(arguments.callee, hover._delay)
                        }
                    }, hover._delay);
                }
            };

        // Attach events
        event.setupHelper([

                "hoverinit",

                "hoverenter",

                "hoverleave",

                "hovermove"
            ], "mouseenter", onmouseenter)

        return $;
    })($, __m3);
})(jQuery);