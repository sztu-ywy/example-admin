export enum OTAChannel {
  Stable = 0,
  Prerelease = 1,
}

export const OTAChannelLabel = {
  [OTAChannel.Stable]: () => $gettext('Stable'),
  [OTAChannel.Prerelease]: () => $gettext('Prerelease'),
}

export enum OTAStatus {
  Enabled = 1,
  Disabled = 0,
}

export const OTAStatusLabel = {
  [OTAStatus.Enabled]: () => $gettext('Enabled'),
  [OTAStatus.Disabled]: () => $gettext('Disabled'),
}
