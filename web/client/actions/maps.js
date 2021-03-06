/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const GeoStoreApi = require('../api/GeoStoreDAO');
const ConfigUtils = require('../utils/ConfigUtils');
const assign = require('object-assign');
const {get, findIndex} = require('lodash');

const MAPS_LIST_LOADED = 'MAPS_LIST_LOADED';
const MAPS_LIST_LOADING = 'MAPS_LIST_LOADING';
const MAPS_LIST_LOAD_ERROR = 'MAPS_LIST_LOAD_ERROR';
const MAP_UPDATING = 'MAP_UPDATING';
const MAP_UPDATED = 'MAP_UPDATED';
const MAP_CREATED = 'MAP_CREATED';
const MAP_DELETING = 'MAP_DELETING';
const MAP_DELETED = 'MAP_DELETED';
const MAP_SAVED = 'MAP_SAVED';
const ATTRIBUTE_UPDATED = 'ATTRIBUTE_UPDATED';
const PERMISSIONS_UPDATED = 'PERMISSIONS_UPDATED';
const THUMBNAIL_ERROR = 'THUMBNAIL_ERROR';
const MAP_ERROR = 'MAP_ERROR';
const SAVE_ALL = 'SAVE_ALL';
const DISPLAY_METADATA_EDIT = 'DISPLAY_METADATA_EDIT';
const RESET_UPDATING = 'RESET_UPDATING';
const SAVE_MAP = 'SAVE_MAP';

function mapsLoading(searchText, params) {
    return {
        type: MAPS_LIST_LOADING,
        searchText,
        params
    };
}

function mapsLoaded(maps, params, searchText) {
    return {
        type: MAPS_LIST_LOADED,
        params,
        maps,
        searchText
    };
}

function loadError(e) {
    return {
        type: MAPS_LIST_LOAD_ERROR,
        error: e
    };
}
function mapCreated(resourceId, metadata, content, error) {
    return {
        type: MAP_CREATED,
        resourceId,
        metadata,
        content,
        error

    };
}

function mapUpdating(resourceId) {
    return {
        type: MAP_UPDATING,
        resourceId
    };
}

function mapUpdated(resourceId, newName, newDescription, result, error) {
    return {
        type: MAP_UPDATED,
        resourceId,
        newName,
        newDescription,
        result,
        error
    };
}
function permissionsUpdated(resourceId, groupPermission, group, userPermission, user, error) {
    return {
        type: PERMISSIONS_UPDATED,
        resourceId,
        groupPermission,
        group,
        userPermission,
        user,
        error
    };
}

function mapDeleted(resourceId, result, error) {
    return {
        type: MAP_DELETED,
        resourceId,
        result,
        error
    };
}

function mapDeleting(resourceId, result, error) {
    return {
        type: MAP_DELETING,
        resourceId,
        result,
        error
    };
}

function attributeUpdated(resourceId, name, value, type, error) {
    return {
        type: ATTRIBUTE_UPDATED,
        resourceId,
        name,
        value,
        error
    };
}

function thumbnailError(resourceId, error) {
    return {
        type: THUMBNAIL_ERROR,
        resourceId,
        error
    };
}

function mapError(error) {
    return {
        type: MAP_ERROR,
        error
    };
}

function saveMap(map, resourceId) {
    return {
        type: SAVE_MAP,
        resourceId,
        map
    };
}

function onDisplayMetadataEdit(displayMetadataEditValue) {
    return {
        type: DISPLAY_METADATA_EDIT,
        displayMetadataEditValue
    };
}

function resetUpdating(resourceId) {
    return {
        type: RESET_UPDATING,
        resourceId
    };
}

function loadMaps(geoStoreUrl, searchText="*", params={start: 0, limit: 20}) {
    return (dispatch) => {
        let opts = assign({}, {params}, geoStoreUrl ? {baseURL: geoStoreUrl} : {});
        dispatch(mapsLoading(searchText, params));
        GeoStoreApi.getResourcesByCategory("MAP", searchText, opts).then((response) => {
            dispatch(mapsLoaded(response, params, searchText));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

function updateMap(resourceId, content, options) {
    return (dispatch) => {
        dispatch(mapUpdating(resourceId, content));
        GeoStoreApi.putResource(resourceId, content, options).then(() => {
            // dispatch(mapUpdated(resourceId, content, "success")); // TODO wrong usage, use another action
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

function updateMapMetadata(resourceId, newName, newDescription, onReset, options) {
    return (dispatch) => {
        GeoStoreApi.putResourceMetadata(resourceId, newName, newDescription, options).then(() => {
            dispatch(mapUpdated(resourceId, newName, newDescription, "success"));
            if (onReset) {
                dispatch(onReset);
            }
        }).catch((e) => {
            // dispatch(mapUpdated(resourceId, newName, newDescription, "failure", e));
            dispatch(thumbnailError(resourceId, e));
        });
    };
}


function updatePermissions(resourceId, groupPermission, group, userPermission, user, options) {
    return (dispatch) => {
        GeoStoreApi.addResourcePermissions(resourceId, groupPermission, group, userPermission, user, options).then(() => {
            dispatch(permissionsUpdated(resourceId, groupPermission, group, userPermission, user, "success"));
        }).catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        });
    };
}

function updateAttribute(resourceId, name, value, type, options) {
    return (dispatch) => {
        GeoStoreApi.updateResourceAttribute(resourceId, name, value, type, options).then(() => {
            dispatch(attributeUpdated(resourceId, name, value, type, "success"));
        }).catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        });
    };
}

function createThumbnail(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, onSuccess, onReset, options) {
    return (dispatch, getState) => {
        let metadata = {
            name: nameThumbnail
        };
        return GeoStoreApi.createResource(metadata, dataThumbnail, categoryThumbnail, options).then((response) => {
            let state = getState();
            let groups = get(state, "security.user.groups.group");
            let index = findIndex(groups, function(g) { return g.groupName === "everyone"; });
            let group;
            if (index < 0 && groups && groups.groupName === "everyone") {
                group = groups;
            } else {
                group = groups[index];
            }
            let user = get(state, "security.user");
            let userPermission = {
                canRead: true,
                canWrite: true
            };
            let groupPermission = {
                canRead: true,
                canWrite: false
            };
            dispatch(updatePermissions(response.data, groupPermission, group, userPermission, user, options)); // UPDATE resource permissions
            const thumbnailUrl = ConfigUtils.getDefaults().geoStoreUrl + "data/" + response.data + "/raw?decode=datauri";
            const encodedThumbnailUrl = encodeURIComponent(encodeURIComponent(thumbnailUrl));
            dispatch(updateAttribute(resourceIdMap, "thumbnail", encodedThumbnailUrl, "STRING", options)); // UPDATE resource map with new attribute
            if (onSuccess) {
                dispatch(onSuccess);
            }
            if (onReset) {
                dispatch(onReset);
            }
            dispatch(saveMap(map, resourceIdMap));
            dispatch(thumbnailError(resourceIdMap, null));
        }).catch((e) => {
            dispatch(thumbnailError(resourceIdMap, e));
        });
    };
}

function saveAll(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, options) {
    return (dispatch) => {
        dispatch(mapUpdating(resourceIdMap));
        if (dataThumbnail !== null && metadataMap !== null) {
            dispatch(createThumbnail(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap,
                updateMapMetadata(resourceIdMap, metadataMap.name, metadataMap.description, onDisplayMetadataEdit(false), options), null, options));
        } else if (dataThumbnail !== null) {
            dispatch(createThumbnail(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, null, onDisplayMetadataEdit(false), options));
        } else if (metadataMap !== null) {
            dispatch(updateMapMetadata(resourceIdMap, metadataMap.name, metadataMap.description, onDisplayMetadataEdit(false), options));
        } else {
            dispatch(resetUpdating(resourceIdMap));
            dispatch(onDisplayMetadataEdit(false));
        }

    };
}

function deleteThumbnail(resourceId, resourceIdMap, options) {
    return (dispatch) => {
        GeoStoreApi.deleteResource(resourceId, options).then(() => {
            dispatch(mapUpdating(resourceIdMap));
            if (resourceIdMap) {
                dispatch(updateAttribute(resourceIdMap, "thumbnail", "NODATA", "STRING", options));
                dispatch(resetUpdating(resourceIdMap));
            }
            dispatch(onDisplayMetadataEdit(false));
        }).catch((e) => {
            // Even if is not possible to delete the Thumbnail from geostore -> reset the attribute in order to display the default thumbnail
            if (e.status === 403) {
                if (resourceIdMap) {
                    dispatch(updateAttribute(resourceIdMap, "thumbnail", "NODATA", "STRING", options));
                }
                dispatch(onDisplayMetadataEdit(false));
                dispatch(thumbnailError(resourceIdMap, null));
            } else {
                dispatch(onDisplayMetadataEdit(true));
                dispatch(thumbnailError(resourceIdMap, e));
            }
        });
    };
}

function createMap(metadata, content, thumbnail, options) {
    return (dispatch) => {
        dispatch(mapUpdating(null));
        GeoStoreApi.createResource(metadata, content, "MAP", options).then((response) => {
            let resourceId = response.data;
            if (thumbnail && thumbnail.data) {
                dispatch(createThumbnail(null, null, thumbnail.name, thumbnail.data, thumbnail.category, resourceId, options));
            }
            dispatch(mapCreated(response.data, assign({id: response.data, canDelete: true, canEdit: true, canCopy: true}, metadata), content));
            dispatch(onDisplayMetadataEdit(false));
            // dispatch(thumbnailError(resourceId, null));
        }).catch((e) => {
            // dispatch(loadError(e));
            dispatch(mapError(e));
        });
    };
}

function deleteMap(resourceId, options) {
    return (dispatch) => {
        dispatch(mapDeleting(resourceId));
        GeoStoreApi.deleteResource(resourceId, options).then(() => {
            dispatch(mapDeleted(resourceId, "success"));
        }).catch((e) => {
            dispatch(mapDeleted(resourceId, "failure", e));
        });
    };
}

module.exports = {
    MAPS_LIST_LOADED,
    MAPS_LIST_LOADING,
    MAPS_LIST_LOAD_ERROR,
    MAP_CREATED, MAP_UPDATING,
    MAP_UPDATED, MAP_DELETED,
    MAP_DELETING, MAP_SAVED,
    ATTRIBUTE_UPDATED,
    PERMISSIONS_UPDATED,
    SAVE_MAP,
    THUMBNAIL_ERROR,
    SAVE_ALL,
    DISPLAY_METADATA_EDIT,
    RESET_UPDATING,
    MAP_ERROR,
    loadMaps,
    updateMap,
    updateMapMetadata,
    deleteMap,
    deleteThumbnail,
    createThumbnail,
    createMap,
    mapUpdating,
    updatePermissions,
    permissionsUpdated,
    attributeUpdated,
    saveMap,
    thumbnailError,
    saveAll,
    onDisplayMetadataEdit,
    resetUpdating,
    mapError
};
