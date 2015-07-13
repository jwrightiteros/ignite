/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var apacheIgnite = require("apache-ignite");
var Ignition = apacheIgnite.Ignition;

/**
  * This example demonstrates very basic operations on cache in functions for Compute.run.
  * <p>
  * Start Ignite node with {@code examples/config/example-ignite.xml} configuration before running example.
  * <p>
  * Alternatively you can run ExampleJsNodeStartup which will
  * start node with {@code examples/config/example-ignite.xml} configuration.
  */
function main() {
    /** Cache name. */
    var cacheName = "RunCacheScriptCache";

    /** Connect to node that started with {@code examples/config/js/example-js-cache.xml} configuration. */
    Ignition.start(['127.0.0.1:8000..9000'], null, onConnect);

    function onConnect(err, ignite) {
        if (err !== null)
            throw "Start remote node with config examples/config/example-ignite.xml.";

        console.log(">>> Run cache script example started.");

        ignite.getOrCreateCache(cacheName, function(err, cache) { runCacheScript(ignite, cache); });
    }

    function runCacheScript(ignite, cache) {
        var key = "John";
        var person = {"firstName": "John", "lastName": "Doe", "salary" : 2000};

        // Store person in the cache
        cache.put(key, person, onPut);

        function onPut(err) {
            var job = function (args) {
                print(">>> Hello node: " + ignite.name());

                var cacheName = args[0];
                var key = args[1];

                /** Get cache with name. */
                var cache = ignite.cache(cacheName);

                /** Get person with name John. */
                var val = cache.get(key);

                return val.salary;
            }

            var onRun = function(err, salary) {
               console.log(">>> " + key + "'s salary is " + salary);

               // Destroying cache.
               ignite.destroyCache(cacheName, function(err) { console.log(">>> End of run cache script example."); });
            }

            /** Run remote job on server ignite node with arguments [cacheName, key]. */
            ignite.compute().run(job, [cacheName, key], onRun);
        }
    }
}

main();