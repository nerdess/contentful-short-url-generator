import * as React from 'react';
import { TextInput } from '@contentful/f36-components';
import { FieldConnector, ConstraintsUtils, CharCounter, CharValidation } from '@contentful/field-editor-shared';
//import * as styles from '@contentful/field-editor-single-line/dist/esm/styles';
import validationRow from './styles';
import rightToLeft from './styles';
function isSupportedFieldTypes(val) {
    return val === 'Symbol' || val === 'Text';
}
export function SingleLineEditor(props) {

    const { field , locales, onClick, onBlur  } = props;


    if (!isSupportedFieldTypes(field.type)) {
        throw new Error(`"${field.type}" field type is not supported by SingleLineEditor`);
    }
    const constraints = ConstraintsUtils.fromFieldValidations(field.validations, field.type);
    const checkConstraint = ConstraintsUtils.makeChecker(constraints);
    const direction = locales.direction[field.locale] || 'ltr';
    return React.createElement(FieldConnector, {
        field: field,
        isInitiallyDisabled: props.isInitiallyDisabled,
        isDisabled: props.isDisabled
    }, ({ value , errors , disabled , setValue  })=>{
        return React.createElement("div", {
            "data-test-id": "single-line-editor"
        }, React.createElement(TextInput, {
            className: direction === 'rtl' ? rightToLeft : '',
            isRequired: field.required,
            isInvalid: errors.length > 0,
            isDisabled: disabled,
            value: value || '',
            onChange: (e)=>{
                setValue(e.target.value);
            },
            onClick:() => {
                console.log('click');
            },
            onBlur:() => {
                console.log('blur');
            }
        }), props.withCharValidation && React.createElement("div", {
            className: validationRow
        }, React.createElement(CharCounter, {
            value: value || '',
            checkConstraint: checkConstraint
        }), React.createElement(CharValidation, {
            constraints: constraints
        })), props.withCharValidation === false && React.createElement("div", {
            className: validationRow
        }, React.createElement(CharCounter, {
            value: value || '',
            checkConstraint: ()=>true
        })));
    });
}
SingleLineEditor.defaultProps = {
    isInitiallyDisabled: true,
    withCharValidation: true
};
