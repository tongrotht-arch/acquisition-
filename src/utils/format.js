
export const formatValidationErrors = (errors) => {
    // If errors is nullish or doesn't contain an issues property, return null.
    if (!errors || !errors.issues)
        return null;

    // If issues is an array, extract the error message from each issue and join them with commas.
    if (Array.isArray(errors.issues))
        return errors.issues.map(i => i.message).join(',');

    // Otherwise, serialize the issues object to a JSON string and return it.
    return JSON.stringify(errors.issues);
}