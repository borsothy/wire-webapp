/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.entity = z.entity || {};

z.entity.Location = class Location extends z.entity.Asset {
  constructor() {
    super();

    this.latitude = '';
    this.longitude = '';
    this.name = '';
    this.type = z.assets.AssetType.LOCATION;
    this.zoom = '';

    this.link_src = ko.pureComputed(() => {
      return z.location.getMapsUrl(this.latitude, this.longitude, this.name, this.zoom);
    });
  }
};
