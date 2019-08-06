const definitions = require('../data/definitions');

/**
 * Parses the name of the appropriate Amazon S3 key corresponding to the
 * original image.
 * @param uri
 * @param requiredPrefix
 */
exports.parseImageKey = (uri, requiredPrefix = null) => {
    // Decode the image request and return the image key
    // Ensure the path starts with our prefix
    let key = decodeURI(uri);
    if (key.startsWith('/')) {
        key = key.substr(1);
    }

    if (requiredPrefix) {
        if (!key.startsWith(requiredPrefix)) {
            key = requiredPrefix + '/' + key;
        }
    }
    return key;
};

/**
 * Assembles an object of query params into a string for hashing. Removes `s` query param automatically
 * @param queryStringParameters
 * @returns {string}
 * @private
 */
exports.buildQueryStringFromObject = (queryStringParameters) => {
    let string = '';
    for (const [k, v] of Object.entries(queryStringParameters)) {
        // Don't hash the security token
        if (k !== 's') {
            string += '&' + k + '=' + encodeURIComponent(v);
        }
    }
    if (string.substr(1) === '') {
        return '';
    }
    return '?' + string.substr(1);
};


/**
 * Extracts the bucket and prefix from a string like,
 * mybucket/some-path/to-objects
 * @param fullPath
 * @returns {{bucket: null, prefix: string}}
 */
exports.processSourceBucket = (fullPath) => {
    let result = {
        prefix: '',
        bucket: null
    };

    let parts = fullPath.split(/\/(.+)/);
    result.bucket = parts[0];
    result.prefix = parts[1];
    if (result.prefix === undefined) {
        result.prefix = '';
    }
    return result;
};

/**
 * Replaces any aliased keys with its base key
 * @param queryParameters
 */
exports.replaceAliases = (queryParameters = {}) => {
     const aliases = definitions.alises;
     Object.keys(aliases).forEach((val) => {
         if(queryParameters[val] !== undefined) {
             Object.defineProperty(queryParameters, aliases[val],
                 Object.getOwnPropertyDescriptor(queryParameters, val));
             delete queryParameters[val];
         }
     });
     return queryParameters;
};

/**
 * Returns a hash for an object
 * @param queryParameters
 * @return {string} hash value
 */
exports.hashQueryParameters = (queryParameters = {}) => {
    const hash = require('object-hash');
    const hashedValue = hash(queryParameters, {unorderedObjects: true, excludeValues: true});
    return hashedValue;
};