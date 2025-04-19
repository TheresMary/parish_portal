function createFieldRquiredValidator(customValidators = {}) {
    return {
        validators: {
            notEmpty: {
                message: 'This field is required'
            },
        }
    };
}