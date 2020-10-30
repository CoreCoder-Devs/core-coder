/* Any validator (email, password, anything) */


const isValidUUIDV4 = require('is-valid-uuid-v4').isValidUUIDV4;
function CustomValidation(){
    this.invalidities = [];
    this.validityChecks = [];
}

CustomValidation.prototype = {
    addInvalidity : function (message) {
        this.invalidities.push(message);
    },

    getInvalidities: function(){
        return this.invalidities.join('. \n');
    },

    checkValidity: function(input){
        var allValid = true;
        var element;
        for (var i = 0; i < this.validityChecks.length; i++){
            var isInvalid = this.validityChecks[i].isInvalid(input);

            if(isInvalid){
                this.addInvalidity(this.validityChecks[i].invalidyMessage);
                allValid = false;
            }
            element = this.validityChecks[i].element;
        }
        

        if(element){
            if(allValid){
                element.classList.add('valid');
                element.classList.remove('invalid');
            }
            else{
                element.classList.add('invalid');
                element.classList.remove('valid');
            }
        }
    }
}

// Checks for validator inputs
function checkInput(input){
    input.CustomValidation.invalidities = [];
    input.CustomValidation.checkValidity(input);

    if (input.CustomValidation.invalidities.length == 0 && input.value != ''){
        // input.setCustomValidity('');
        return true;
    }else{
        // input.setCustomValidity(input.CustomValidation.getInvalidities());
        return false;
    }
}
function initCreateValidators(){
    projectNameValidityChecks = [
        {
            isInvalid: function(input){
                return input.value.length < 3;
            },
            invalidyMessage: 'Name is too short',
            element: document.getElementById('input-create-name')
        },
        
        {
            isInvalid: function(input){
                let reservedChars = '><:".\\|?*'.split('');
                for(var char in reservedChars){
                    if(input.value.includes(reservedChars[char]))
                        return true;
                }
                return false;
            },
            invalidyMessage: 'Invalid characters '+"('><:\".\\|?*')",
            element: document.getElementById('input-create-name')
        },
        
        
        {
            isInvalid: function(input){
                for(var p in PROJECTS_BP){
                    if((input.value + ' BP').toLowerCase() ===  PROJECTS_BP[p].name.toLowerCase())
                        return true;
                }
                return false;
            },
            invalidyMessage: 'Project with that name already exists',
            element: document.getElementById('input-create-name')
        }
    ];
    projectUUIDValidityChecks = [
        {
            isInvalid: function(input){
                
                return !isValidUUIDV4(input.value);
            },
            invalidyMessage: 'Invalid UUID',
            element: document.getElementById('input-create-uuid')
        }
    ];
    projectDescValidityChecks = [
        {
            isInvalid: function(input){
                return input.value.length < 3;
            },
            invalidyMessage: 'Desc is too short',
            element: document.getElementById('input-create-desc')
        },
    ];
    // Connect the elements to costumvalidator
    var projectNameInput = document.getElementById('input-create-name');
    projectNameInput.CustomValidation = new CustomValidation();
    projectNameInput.CustomValidation.validityChecks = projectNameValidityChecks;

    var projectUUIDInput = document.getElementById('input-create-uuid');
    projectUUIDInput.CustomValidation = new CustomValidation();
    projectUUIDInput.CustomValidation.validityChecks = projectUUIDValidityChecks;

    var projectDescInput = document.getElementById('input-create-desc');
    projectDescInput.CustomValidation = new CustomValidation();
    projectDescInput.CustomValidation.validityChecks = projectDescValidityChecks;

    projectCreateInputs = [projectNameInput,projectUUIDInput,projectDescInput];

    // Event Listeners
    var buttonCreate = document.getElementById('button-create');
    buttonCreate.addEventListener('click', function(){
        var isInvalid = false;

        // Checks for validity of every elements there
        for(var i = 0; i < projectCreateInputs.length; i++){
            isInvalid = !checkInput(projectCreateInputs[i]);
        }

        var validator = document.getElementById('validator');
        validator.innerText = '';
        if(!isInvalid){
            createProject();
        }else{
            validator.innerText = getInvalidationMessages(projectCreateInputs);
        }
        
    });
    var validator = document.getElementById('validator');
    validator.innerText = '';
    for(var i = 0; i < projectCreateInputs.length; i++){
        projectCreateInputs[i].classList.remove('valid');
        projectCreateInputs[i].classList.remove('invalid');
        projectCreateInputs[i].value = '';
        projectCreateInputs[i].addEventListener('keyup', function(){
            checkInput(this);
            validator.innerText = getInvalidationMessages(projectCreateInputs);
        });
    }
}

function getInvalidationMessages(arr){
    var messages = '';
    for(var i = 0; i < arr.length; i++){
        messages += arr[i].CustomValidation.invalidities.join('\n')+'\n';
    }
    return messages;
}

function refreshCreateValidators(){
    // Refrsh the validity of the inputs
    var isInvalid = false;

    // Checks for validity of every elements there
    for(var i = 0; i < projectCreateInputs.length; i++){
        isInvalid = !checkInput(projectCreateInputs[i]);
    }

    var validator = document.getElementById('validator');
    validator.innerText = '';
    if(!isInvalid){
    }else{
        validator.innerText = getInvalidationMessages(projectCreateInputs);
    }
}