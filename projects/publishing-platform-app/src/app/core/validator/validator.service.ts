import { AbstractControl, FormControl } from '@angular/forms';
import { isDevMode } from '@angular/core';

export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        const config = {
            'email': 'email',
            'required': 'required',
            'invalidEmailAddress': 'invalidEmailAddress',
            'currentPassword': 'currentPassword',
            'primary': 'primary',
            'invalidConfirmPassword': 'invalidConfirmPassword',
            'invalidPassword': 'invalidPassword',
            'maxlength': 'maxlength'
        };

        return config[validatorName];
    }

    static emailValidator(control) {
        if (
            control.value &&
            control.value.match(
                /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            )
        ) {
            return null;
        } else {
            return { email: true };
        }
    }

    static isEmail(text) {
        if (
            text &&
            text.match(
                /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            )
        ) {
            return true;
        }
        return false;
    }

    static passwordValidator(control) {
        if (
            control.value &&
            control.value.match(
                /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
            )
        ) {
            return null;
        } else {
            return { invalidPassword: true };
        }
    }

    static passwordsEqualValidator(c: FormControl) {
        if (
            c.value &&
            c.value.password.length > 0 &&
            (c.value.confirmPassword.length > 0 &&
                c.value.password !== c.value.confirmPassword)
        ) {
            return { invalidConfirmPassword: true };
        } else {
            return null;
        }
    }

    static validateDecimal(event: any, formValue) {
        let input;
        const regex = /^([+]?(?!00)[0-9]*\.?[0-9]{0,8})$/;

        if (event.type === 'paste') {
            const value = event.clipboardData.getData('Text');
            input = formValue ? formValue + value : value;
        } else if (event.type === 'keydown') {
            input = event.target.value;
        } else if (event.type === 'input') {
            input = event.target.value;
        }

        if (!regex.test(input)) {
            if (isDevMode()) {
                console.log(input, 'is not a number');
            }
            event.preventDefault();
            return false;
        }
        return true;
    }

    static requireOneDate(control) {
        if (control.value && (control.value.from_date || control.value.to_date)) {
            return null;
        } else {
            return { dateRequire: true };
        }
    }

    static noSpaceValidator(control) {
        if (
            control.value &&
            (control.value.first_name && control.value.first_name.search(/\S/) == -1)
        ) {
            return { notSpaceRequire: true };
        } else {
            return null;
        }
    }

    static required = (c: AbstractControl) => !(c.value && c.value.trim()) ? { required: true } : null;

    static noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
    }
}
