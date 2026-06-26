/* INSTALL CODE
<script>
    if (typeof FrankRiskForms == 'undefined') {
        var script = document.createElement("script");
        var version = new Date().getTime();
        script.src = "https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/clients/FrankRiskJSLibrary.js?v="+version;
        document.getElementsByTagName('head')[0].appendChild(script);
    }    

    WaitForLibrary(function() {
        //Run Functions
    });
    
    function WaitForLibrary(callback) {
        if (typeof FrankRiskForms !== "undefined" && typeof $ !== "undefined") {
            callback();
        } else {
            setTimeout(function() {
            WaitForLibrary(callback);
            }, 100);
        }
    };
</script>
*/

var FrankRiskForms = (function() {
    var methods = {};

    // Load prerequisites
    var version = new Date().getTime();

    var load = true;
    
    if (window.location.search.includes("noload", 0) === true) {
        load = false;
    }
    if (load) {
        var scripts = [
            "https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/global/jquery-3.6.0.js",
            "https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/global/jg_bootstrap.bundle.js",
            "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"
        ];

        scripts.forEach(function(src) {
            var script = document.createElement("script");
            script.src = src + "?v=" + version;
            document.getElementsByTagName('head')[0].appendChild(script);
        });

        var links = [
            "https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/global/jg_bootstrap.css",
            "https://cdn.jsdelivr.net/gh/PowerLabs-NZ/resources@release/clients/FrankRisk.css",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
        ];

        links.forEach(function(href) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href + "?v=" + version;
            link.crossorigin = "anonymous";
            document.getElementsByTagName('head')[0].appendChild(link);
        });

        methods.loadForm = function(formID, formNumber, element, saveURL = null) {
            var scriptLoad = document.createElement('script');
            scriptLoad.setAttribute('src', 'https://www.cognitoforms.com/f/seamless.js');
            scriptLoad.setAttribute('data-key', formID);
            scriptLoad.setAttribute('data-form', formNumber);
            document.getElementsByTagName('head')[0].append(scriptLoad);

            WaitForCognito(function(){
                if (typeof Cognito !== undefined) {
                    var formContext = Cognito.mount(formNumber, element);
                    
                    formContext.on('ready', function(event) {     
                        console.log("Form Fully Loaded");
                        addButtons();
                        checkForCanvasPlaceholder();
                        // Set up a MutationObserver to watch for conditional logic revealing the placeholder
                        var targetNode = document.querySelector('body .cog-form__container');
                        if (targetNode) {
                            var observer = new MutationObserver(function(mutationsList, observer) {
                                // Debounce the check to keep performance snappy
                                clearTimeout(window.canvasCheckTimeout);
                                window.canvasCheckTimeout = setTimeout(function() {
                                    checkForCanvasPlaceholder();
                                }, 50);
                            });
                            
                            // Watch for any elements being added/removed inside the form
                            observer.observe(targetNode, { childList: true, subtree: true });
                        }
                    });

                    function addButtons(page = "") {
                        // Added 'body' to strictly target the visible form
                        var cogpage = $('body .cog-form__container .cog-body div.cog-page' + page);
                        var cogbody = $('body .cog-form__container .cog-body');

                        // Remove existing nav to prevent duplicates on re-render
                        cogbody.find('.jg_navigation').remove();

                        // Create new Navigation Row
                        var navigationRow = $('<div class="cog-row jg_navigation" style="margin-bottom: 15px;"></div>');

                        // Create containers for Left (Nav) and Right (Actions)
                        var leftContainer = $('<div class="cog-col cog-col--6 jg_floatChildButtonLeft"></div>');
                        var rightContainer = $('<div class="cog-col cog-col--6 jg_floatChildButtonRight"></div>');

                        var hasLeft = false;
                        var hasRight = false;

                        // --- RIGHT SIDE: Save and Submit ---
                        
                        // 1. Save Button
                        var $bottomSave = cogpage.find('.cog-page__navigation button.cog-button--save');
                        if ($bottomSave.length !== 0) {
                            var saveButton = $bottomSave.first().clone();
                            saveButton.on('click', function() {
                                // Added 'body' to strictly target the visible form button
                                var target = $('body div.cog-form__container div.cog-page' + page + ' div.cog-page__navigation button.cog-button--save')[0];
                                if (target) target.click();
                            });
                            saveButton.css('margin', '0 0 0 1rem');
                            rightContainer.append(saveButton);
                            hasRight = true;
                        }

                        // 2. Submit Button
                        var $bottomSubmit = cogpage.find('.cog-page__navigation button.cog-button--submit');
                        if ($bottomSubmit.length !== 0) {
                            var submitButton = $bottomSubmit.first().clone();
                            submitButton.on('click', function() {
                                // Added 'body'
                                var target = $('body div.cog-form__container div.cog-page' + page + ' div.cog-page__navigation button.cog-button--submit')[0];
                                if (target) target.click();
                            });
                            submitButton.css('margin', '0 0 0 1rem');
                            rightContainer.append(submitButton);
                            hasRight = true;
                        }

                        // --- LEFT SIDE: Next and Back ---
                        
                        // 3. Back Button
                        var $bottomBack = cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--back');
                        if ($bottomBack.length !== 0) {
                            var backButton = $bottomBack.first().clone();
                            backButton.on('click', function() {
                                // Added 'body'
                                var target = $('body div.cog-form__container div.cog-page' + page + ' div.cog-page__navigation .cog-button--navigation.cog-button--back')[0];
                                if (target) target.click();
                            });
                            backButton.css('margin', '0 1rem 0 0');
                            backButton.css('padding', '0.4rem 0.7rem 0.4rem 0.7rem');
                            leftContainer.append(backButton);
                            hasLeft = true;
                        }

                        // 4. Next Button
                        var $bottomNext = cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--next');
                        if ($bottomNext.length !== 0) {
                            var nextButton = $bottomNext.first().clone();
                            nextButton.on('click', function() {
                                // Added 'body'
                                var target = $('body div.cog-form__container div.cog-page' + page + ' div.cog-page__navigation .cog-button--navigation.cog-button--next')[0];
                                if (target) target.click();
                            });
                            nextButton.css('margin', '0 1rem 0 0');
                            leftContainer.append(nextButton);
                            hasLeft = true;
                        }

                        // --- ASSEMBLY ---
                        
                        if (hasLeft) navigationRow.append(leftContainer);
                        if (hasRight) navigationRow.append(rightContainer);

                        // Apply flexbox spacing classes based on what rendered
                        if (hasLeft && hasRight) {
                            navigationRow.addClass('justify-content-spacebetween');
                        } else if (!hasLeft && hasRight) {
                            navigationRow.addClass('justify-content-end');
                        } 

                        // Inject the top row if we actually found buttons to clone
                        if (hasLeft || hasRight) {
                            // Added 'body'
                            $('body .cog-form__container .cog-body').prepend(navigationRow);
                        }
                    }

                    // --- Drawing Canvas Integration Logic ---
                    function checkForCanvasPlaceholder() {
                        var targetText = "CANVAS_PLACEHOLDER";
                        var $placeholderEl = $("body .cog-markdown, body .cog-content").filter(function() {
                            return $(this).text().indexOf(targetText) > -1;
                        });

                        // If the text is present, build the canvas
                        if ($placeholderEl.length > 0 && !$placeholderEl.hasClass('canvas-initialized')) {
                            initCanvasElement($placeholderEl, targetText);
                        } 
                        // FIX: If the text is GONE and the Canvas is GONE, give visibility control back to Cognito
                        else if ($placeholderEl.length === 0 && $('body .fr-canvas-wrapper').length === 0) {
                            $('body .cog-file').css('display', '');
                        }
                    }

                    // Add this variable at the top of your FrankRiskForms IIFE, outside of 'methods'
                    var activeCanvas = null;

                    function initCanvasElement($el, marker) {
                        // 1. Properly dispose of the previous instance if it exists
                        if (activeCanvas) {
                            activeCanvas.dispose();
                            activeCanvas = null;
                        }

                        $el.addClass('canvas-initialized').html('');

                        var canvasId = "fr_diagram_canvas";
                        var htmlStructure = `
                            <div class="fr-canvas-wrapper" style="margin-bottom: 15px;">
                                <label class="cog-label" style="display:block; margin-bottom:8px;">Draw your diagram below:</label>
                                <canvas id="${canvasId}" width="600" height="300" style="border: 2px dashed #ccc; background: #fff; cursor: crosshair; display: block; max-width: 100%; touch-action: none;"></canvas>
                                <div style="margin-top: 10px; display: flex; align-items: center; flex-wrap: wrap;">
                                    <button type="button" id="fr_save_canvas" class="el-button cog-button cog-button--primary" style="margin-right: 10px;">
                                        <span class="cog-button__text">Save & Attach Drawing</span>
                                    </button>
                                    <button type="button" id="fr_clear_canvas" class="el-button cog-button cog-button--secondary" style="margin-right: 15px;">
                                        <span class="cog-button__text">Clear</span>
                                    </button>
                                    <span id="fr_canvas_status" style="font-size: 13px; color: green; display:none; font-weight: bold;">&#10003; Attached successfully!</span>
                                </div>
                                <style>
                                    .fr-canvas-wrapper .canvas-container {
                                        touch-action: none; /* Prevents the browser from hijacking your touch/drawing events */
                                        -webkit-user-select: none; /* Prevents text selection while drawing on iOS */
                                        user-select: none;
                                    }
                                    .fr-canvas-wrapper .canvas-container .upper-canvas {
                                        background-color: transparent !important;
                                    }
                                </style>
                            </div>
                        `;
                        $el.append(htmlStructure);

                        // Locate the JSON field by label
                        var $jsonField = $('body .cog-field:has(label:contains("DiagramJSON"))').find('textarea');
                        $jsonField.closest('.cog-row').hide(); 

                        // Find and hide the file upload component
                        var $fileUploadContainer = $el.closest('.cog-row').prevAll('.cog-row').has('.cog-file').first().find('.cog-file');
                        if ($fileUploadContainer.length === 0) {
                            $fileUploadContainer = $el.closest('.cog-page').find('.cog-file');
                        }
                        $fileUploadContainer.hide();

                        // 2. Initialize and assign to the global tracker
                        setTimeout(function() {
                            activeCanvas = setupCanvasDrawing(canvasId, $fileUploadContainer, $jsonField);
                        }, 100);
                    }

                    function setupCanvasDrawing(canvasId, $uploadContainer, $jsonField) {
                        // 1. Initialize Fabric with explicit dimensions and a container-ready callback
                        var canvas = new fabric.Canvas(canvasId, {
                            isDrawingMode: true,
                            backgroundColor: '#fff',
                            width: 600,
                            height: 300
                        });

                        canvas.freeDrawingBrush.width = 3;
                        canvas.freeDrawingBrush.color = '#333333';

                        // 2. Load existing JSON
                        var savedEncoded = $jsonField.val();
                        if (savedEncoded) {
                            try {
                                var savedJSON = atob(savedEncoded); // Decode back to JSON
                                canvas.loadFromJSON(savedJSON, canvas.renderAll.bind(canvas));
                            } catch (e) {
                                console.error("Failed to decode JSON:", e);
                            }
                        }

                        // 3. FORCE REDRAW ON PATH CREATION (Fixes the disappearing lines)
                        canvas.on('path:created', function() {
                            canvas.renderAll();
                            
                            // Auto-save the JSON to the field on every stroke
                            var jsonState = JSON.stringify(canvas.toObject(['left', 'top', 'width', 'height', 'fill', 'stroke', 'strokeWidth', 'path']));
                            var encodedState = btoa(unescape(encodeURIComponent(jsonState))); 
                            
                            // 3. THE SLEDGEHAMMER: Update the DOM directly and trigger all events
                            var textarea = $jsonField[0];
                            
                            // Set the value via property, not just jQuery val()
                            textarea.value = encodedState; 
                            
                            // Fire the specific sequence of events that Vue/Cognito listens for
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            textarea.dispatchEvent(new Event('change', { bubbles: true }));
                            textarea.dispatchEvent(new Event('blur', { bubbles: true }));
                        });

                        // 4. Save Button
                        $('#fr_save_canvas').on('click', function(e) {
                            e.preventDefault();
                            canvas.renderAll();

                            // 1. Clear old file (Required for "Only 1 file may be uploaded")
                            $uploadContainer.find('button[title^="Remove"]').click(); 

                            // 2. Encode
                            var jsonState = JSON.stringify(canvas.toObject(['left', 'top', 'width', 'height', 'fill', 'stroke', 'strokeWidth', 'path']));
                            var encodedState = btoa(unescape(encodeURIComponent(jsonState))); 
                            
                            // 3. THE SLEDGEHAMMER: Update the DOM directly and trigger all events
                            var textarea = $jsonField[0];
                            
                            // Set the value via property, not just jQuery val()
                            textarea.value = encodedState; 
                            
                            // Fire the specific sequence of events that Vue/Cognito listens for
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            textarea.dispatchEvent(new Event('change', { bubbles: true }));
                            textarea.dispatchEvent(new Event('blur', { bubbles: true }));

                            // 4. Render and Inject Image
                            var dataURL = canvas.toDataURL({ format: 'png' });
                            fetch(dataURL)
                                .then(res => res.blob())
                                .then(blob => {
                                    var file = new File([blob], "canvas_diagram.png", { type: "image/png" });
                                    var fileInput = $uploadContainer.find('input[type="file"]')[0];
                                    
                                    if (fileInput) {
                                        var dataTransfer = new DataTransfer();
                                        dataTransfer.items.add(file);
                                        fileInput.files = dataTransfer.files;
                                        
                                        // Dispatch input and change to tell Cognito a file has arrived
                                        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                                        fileInput.dispatchEvent(new Event('input', { bubbles: true }));

                                        $('#fr_canvas_status').html('&#10003; Attached successfully!').fadeIn().delay(3000).fadeOut();
                                    }
                                });
                        });

                        // 5. Clear Button
                        $('#fr_clear_canvas').on('click', function() {
                            canvas.clear();
                            canvas.backgroundColor = '#fff';
                            canvas.renderAll();
                            
                            var textarea = $jsonField[0];
                            
                            // Set the value via property, not just jQuery val()
                            textarea.value = ''; 
                            
                            // Fire the specific sequence of events that Vue/Cognito listens for
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            textarea.dispatchEvent(new Event('change', { bubbles: true }));
                            textarea.dispatchEvent(new Event('blur', { bubbles: true }));
                            
                            // Find the actual button Cognito uses to remove the file
                            // It's usually the one with the 'Remove' title
                            $uploadContainer.find('button[title^="Remove"]').click(); 
                            
                            $('#fr_canvas_status').hide();
                        });

                        return canvas;
                    }

                    formContext.on('afterNavigate', function(event) {
                        var filter = '[data-page="'+event.data.destinationPage.number+'"]';
                        addButtons(filter);
                        // Crucial: check for the canvas placeholder every time the page changes
                        checkForCanvasPlaceholder();
                    });

                    formContext.on('beforeNavigate', function(event) {
                        if (window.location.hash && typeof restrictNavigate !== 'undefined' && restrictNavigate) {
                            event.preventDefault();
                            restrictNavigate = false;
                        }
                    });

                    if (saveURL != null && saveURL != "" && saveURL != "null" && saveURL != undefined) {
                        formContext.on('afterSave', function(event) {
                            var link = event.data.link.split(/\#+/);
                            if (link.length > 1) {
                                var code = link[1];
                                var newLink = saveURL + "#" + code;
                                $('#cog-cog-save-resume-link').val(newLink);
                            }
                            $('.cog-dialog .el-dialog__wrapper .el-dialog .el-dialog__body .cog-row:last-child').css('display', 'none');
                        });
                    }
                }
            });
        };

        function WaitForCognito(callback) {
            if (typeof Cognito !== "undefined") {
                console.log('Cognito API Loaded');
                callback();
            } else {
                setTimeout(function() {
                    WaitForCognito(callback);
                }, 100);
            }
        }
    }

    return methods;
})();