var FrankRiskForms = (function() {
    var methods = {};
    var version = new Date().getTime();
    var load = true;
    if (window.location.search.includes("noload", 0) === true) {
        load = false;
    }
    if (load) {
        /*<script>
        if (typeof FrankRiskForms != 'undefined') {
            FrankRiskForms.loadSPForm('75474567457', 1, '#form1', 'https://www.frankrisk.co.nz/liability-renewal-declaration');
        }
        </script>*/

        methods.loadSPForm = function(formID, formNumber, element, saveURL = null) {
            var scriptLoad = document.createElement('script');
            scriptLoad.setAttribute('src', 'https://www.cognitoforms.com/f/seamless.js');
            scriptLoad.setAttribute('data-key', formID);
            scriptLoad.setAttribute('data-form', formNumber);
            document.getElementsByTagName('head')[0].append(scriptLoad);

            WaitForCognito(function(){
                if (typeof Cognito !== 'undefined') {
                    $.ajax({
                        url: "/_api/web/CurrentUser",
                        success: function(SPContext) {
                            var fields = {
                                "UPN": SPContext.UserPrincipalName,
                                "UserDisplayName": SPContext.Title
                            };
                            if (typeof formNumber == 'number') formNumber = formNumber.toString();
                            var formContext = Cognito.mount(formNumber, element).prefill(fields);
                            console.log(formContext);
                            formContext.on('ready', function(event) {     
                                console.log("Form Fully Loaded");
                                //addButtons();
                            });
                            
                            function addButtons(page = "") {
                                var cogpage = $('.cog-form__container .cog-body div.cog-page'+page);
            
                                var cogbody = $('.cog-form__container .cog-body');
            
                                //Remove existing nav and re-evaluate
                                cogbody.find('.jg_navigation').remove();
            
                                //Create new Navigation Row
                                var navigationRow = $('<div class="cog-row jg_navigation"></div>');
            
                                //If Save Button Exists copy to top
                                if (cogpage.find('.cog-page__navigation .cog-button--save').length != 0) {
                                    //Clone Existing Save Button
                                    var saveButton = cogpage.find('div.cog-page__navigation button.cog-button--save:visible').first().clone();
            
                                    //Clone the template button for reset function
                                    var resetButton = saveButton.clone();
            
                                    //Create Save buttons DIV
                                    var buttonsContainer = $('<div class="cog-col cog-col--6 jg_floatChildButtonRight"></div>')
            
                                    //Get the text node and rename it to "Reset"
                                    resetButton.find('.cog-button__text').text("Reset Form");
            
                                    //When our reset button is clicked modify the href to remove the save url section
                                    resetButton.on('click', function() {
                                        window.location.href = window.location.href.split('#')[0];
                                    });
            
                                    //Add some margin to seperate the reset and save buttons
                                    resetButton.css('margin', '0 1rem');
            
                                    //When our save button is clicked just mimic clicking the save button at the bottom
                                    saveButton.on('click', function() {
                                        $('div.cog-form__container div.cog-page'+page+' div.cog-page__navigation button.cog-button--save:visible').first().click();
                                    });
            
                                    //append the save and reset buttons to the container
                                    buttonsContainer.append(resetButton);
                                    buttonsContainer.append(saveButton);
                                    
                                    navigationRow.append(buttonsContainer);
                                }
            
                                //If the page has a progress bar then it has multiple pages we need to account for
                                if (cogpage.find('.cog-page-progress').length == 0) {
                                    var buttons = [];
            
                                    if(cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--next:visible').length != 0) {
                                        var nextButton = cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--next:visible').first().clone();
                                        nextButton.on('click', function() {
                                            $('div.cog-form__container div.cog-page'+page+' div.cog-page__navigation .cog-button--navigation.cog-button--next:visible').first().click();
                                        });
                                        nextButton.css('margin', '0 1rem');
                                        buttons.push(nextButton);
                                    }        
                                    if(cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--back:visible').length != 0) {
                                        var backButton = cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--back:visible').first().clone();
                                        backButton.on('click', function() {
                                            $('div.cog-form__container div.cog-page'+page+' div.cog-page__navigation .cog-button--navigation.cog-button--back:visible').first().click();
                                        });
                                        backButton.css('margin', '0 1rem');
                                        buttons.push(backButton);
                                    }
            
                                    var navButtons = $('<div class="cog-col cog-col--6 jg_floatChildButtonLeft"></div>');
            
                                    for (var i = 0; i < buttons.length; i++) {
                                        navButtons.prepend(buttons[i]);
                                    }
            
                                    navigationRow.prepend(navButtons);
                                }
            
                                //Set spacing class depending on the number of children, if no child elements then don't add the row to the form
                                if (navigationRow.children().length == 1) {
                                    navigationRow.addClass('justify-content-end');
                                    $('.cog-form__container .cog-body').prepend(navigationRow);
                                }
                                else if (navigationRow.children().length == 2) {
                                    navigationRow.addClass('justify-content-spacebetween');
                                    $('.cog-form__container .cog-body').prepend(navigationRow);
                                }
                                
                            }
                            
                            formContext.on('afterNavigate', function(event) {
                                var filter = '[data-page="'+event.data.destinationPage.number+'"]';
                                //addButtons(filter);
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
                        },
                        dataType: 'json',
                    })
                    
                }
            });
        };

        methods.loadForm = function(formID, formNumber, element, saveURL = null) {
            var scriptLoad = document.createElement('script');
            scriptLoad.setAttribute('src', 'https://www.cognitoforms.com/f/seamless.js');
            scriptLoad.setAttribute('data-key', formID);
            scriptLoad.setAttribute('data-form', formNumber);
            document.getElementsByTagName('head')[0].append(scriptLoad);

            WaitForCognito(function(){
                if (typeof Cognito !== 'undefined') {
                    formContext = Cognito.mount(formNumber, element);
                    formContext.on('ready', function(event) {     
                        console.log("Form Fully Loaded");
                        //addButtons();
                    });
                    
                    function addButtons(page = "") {
                        var cogpage = $('.cog-form__container .cog-body div.cog-page'+page);

                        var cogbody = $('.cog-form__container .cog-body');

                        //Remove existing nav and re-evaluate
                        cogbody.find('.jg_navigation').remove();

                        //Create new Navigation Row
                        var navigationRow = $('<div class="cog-row jg_navigation"></div>');

                        //If Save Button Exists copy to top
                        if (cogpage.find('.cog-page__navigation .cog-button--save').length != 0) {
                            //Clone Existing Save Button
                            var saveButton = cogpage.find('div.cog-page__navigation button.cog-button--save:visible').first().clone();

                            //Create Save buttons DIV
                            var buttonsContainer = $('<div class="cog-col cog-col--6 jg_floatChildButtonRight"></div>')

                            //When our save button is clicked just mimic clicking the save button at the bottom
                            saveButton.on('click', function() {
                                $('div.cog-form__container div.cog-page'+page+' div.cog-page__navigation button.cog-button--save:visible').first().click();
                            });

                            //append the save and reset buttons to the container

                            buttonsContainer.append(saveButton);
                            
                            navigationRow.append(buttonsContainer);
                        }

                        //If the page has a progress bar then it has multiple pages we need to account for
                        if (cogpage.find('.cog-page-progress').length == 0) {
                            var buttons = [];

                            if(cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--next:visible').length != 0) {
                                var nextButton = cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--next:visible').first().clone();
                                nextButton.on('click', function() {
                                    $('div.cog-form__container div.cog-page'+page+' div.cog-page__navigation .cog-button--navigation.cog-button--next:visible').first().click();
                                });
                                nextButton.css('margin', '0 1rem');
                                buttons.push(nextButton);
                            }

                            if(cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--back:visible').length != 0) {
                                var backButton = cogpage.find('.cog-page__navigation .cog-button--navigation.cog-button--back:visible').first().clone();
                                backButton.on('click', function() {
                                    $('div.cog-form__container div.cog-page'+page+' div.cog-page__navigation .cog-button--navigation.cog-button--back:visible').first().click();
                                });
                                backButton.css('margin', '0 1rem');
                                buttons.push(backButton);
                            }

                            var navButtons = $('<div class="cog-col cog-col--6 jg_floatChildButtonLeft"></div>');

                            for (var i = 0; i < buttons.length; i++) {
                                navButtons.prepend(buttons[i]);
                            }

                            

                            navigationRow.prepend(navButtons);
                        }

                        //Set spacing class depending on the number of children, if no child elements then don't add the row to the form
                        if (navigationRow.children().length == 1) {
                            navigationRow.addClass('justify-content-end');
                            $('.cog-form__container .cog-body').prepend(navigationRow);
                        }
                        else if (navigationRow.children().length == 2) {
                            navigationRow.addClass('justify-content-spacebetween');
                            $('.cog-form__container .cog-body').prepend(navigationRow);
                        }
                        
                    }
                    
                    formContext.on('afterNavigate', function(event) {
                        var filter = '[data-page="'+event.data.destinationPage.number+'"]';
                        //addButtons(filter);
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

        methods.buildListPage = function (element, column_width = 4) {
            element = $(element);
            const forms = JSON.parse('[{"title":"Liability Renewal Declaration","id":1,"link":"liability-renewal-declaration"},{"title":"Fire and Emergency Levy","id":2,"link":"fire-and-emergency-levy"},{"title":"Vehicle List","id":4,"link":"vehicle-list"},{"title":"Gross Rents Declaration","id":7,"link":"gross-rents-client-declaration"},{"title":"SME Proposal","id":3,"link":"sme-proposal"},{"title":"Marine Cargo Declaration","id":8,"link":"marine-cargo-declaration"},{"title":"Annual Contract Works Declaration","id":9,"link":"annual-contract-works-declaration"},{"title":"Carrier Liability Declaration","id":10,"link":"carriers-liability-declaration"},{"title":"Management Liability Proposal","id":5,"link":"management-liability-proposal"},{"title":"Frankie Management & Cyber Liability Proposal form","id":11,"link":"https://www.cognitoforms.com/FrankRiskManagement/CyberManagementLiabilityInsuranceProposal"},{"title":"Management Liability Declaration","id":12,"link":"management-liability-declaration"},{"title":"Allianz Travel Declaration","id":15,"link":"allianz-travel-declaration"},{"title":"Contract Works Extension Questionnaire","id":13,"link":"contract-works-extension-questionnaire"},{"title":"Investment Manager Insurance","id":16,"link":"investment-manager-insurance"},{"title":"Public Liability Claim Form","id":14,"link":"public-liability-claim-form"},{"title":"TMGCloudland Cyber Liability Questions","id":18,"link":"https://www.cognitoforms.com/FrankRiskManagement/TMGCloudlandCyberLiabilityQuestions"}]');
            element.append(buildBootstrapGrid(forms, column_width));
        };

        function buildBootstrapGrid(list_array, column_width) {
            var row = $('<div class="btn-width-100 jg_bs row g-5 mx-5 text-center"></div>');
            list_array.forEach((form) => {
                let col = $(`<div class="col-${column_width}"></div>`);
                let button_container = $(`<span class="pl_primarysecondarybuttons">
                    <a class="jg_bs btn btn-default btn-warning pl_buttonprimary">${form.title}</a>
                    <a title="Copy link to public form" class="jg_bs btn btn-default btn-warning pl_buttonsecondary" onclick="FrankRiskForms.copytoclipboard(this, '${form.link.startsWith('https')? form.link : 'https://www.frankrisk.co.nz/' + form.link}')">
                        <i class="fa-regular fa-copy"></i>
                    </a>
                </span>`)
                let primaryButton = button_container.find('.pl_buttonprimary');
                primaryButton.on('click', (event) => {
                    console.log('Clicked on' + form.title);
                });
                col.append(button_container);
                row.append(col);
            });
            return row;
        };

        methods.copytoclipboard = function(element, link) {
            navigator.clipboard.writeText(link);
            console.log(link);
            console.log(element);
            if (element !== null && link !== null) {
                var primaryButton = $(element).parent().find('.pl_buttonprimary');
                if (primaryButton.length > 0) {
                    var originaltext = primaryButton.text();
                    primaryButton.text("Public URL copied to Clipboard");
                    setTimeout(function() {
                        primaryButton.text(originaltext)
                    }, 1500);
                }
            }
        }

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

        return methods;
    }
    else {
        console.log("Preventing load of custom scripts because of 'noload' query parameter");
        alert("Preventing load of custom scripts because of 'noload' query parameter");
    }
})();