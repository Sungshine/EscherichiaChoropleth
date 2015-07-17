var rawObjects = null;
            var rawStrains = [];

            function contains(array, item) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] === item) {
                        return true;
                    }
                }
                return false
            }

            function renderCSVDropdown(csv) {
                    var dropdown = $('select#strains');
                    for(var i = 0; i < csv.length; i++) {
                        var record = csv[i];
                        // console.log("record: " + record["PFGE-XbaI-pattern"])
                        if (!contains(rawStrains, record["PFGE-XbaI-pattern"])) {
                            rawStrains.push(record["PFGE-XbaI-pattern"]);
                            var entry = $('<option>').attr('value', record["PFGE-XbaI-pattern"]).html(record["PFGE-XbaI-pattern"]);
                            dropdown.append(entry);
                        }
                    }

                    // starts the dropdown as blank
                    $('#strains').prop("selectedIndex", -1);
                    // console.log(rawStrains);
            };

            function popDropdown() {
                var csv_path = "EC_data2014_v2.csv";
                $.get(csv_path, function(data) {
                    rawObjects = $.csv.toObjects(data);
                    renderCSVDropdown(rawObjects);
                })};

            popDropdown();

            function selected(index) {
                console.log("selected " + rawObjects[index]["PFGE-XbaI-pattern"]);
            }
