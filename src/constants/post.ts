export enum PostContentType {
  Link = 'link',
  Richtext = 'richtext',
}

export const PostContentTypeMask = {
  [PostContentType.Link]: () => $gettext('Link'),
  [PostContentType.Richtext]: () => $gettext('Richtext'),
}

export const PostContentTypeOptions = [
  {
    label: $gettext('Rich Text'),
    value: PostContentType.Richtext,
  },
  {
    label: $gettext('Link'),
    value: PostContentType.Link,
  },
]

export enum PostStatus {
  Draft = 'draft',
  Publish = 'publish',
  Private = 'private',
}

export const PostStatusMask = {
  [PostStatus.Draft]: () => $gettext('Draft'),
  [PostStatus.Publish]: () => $gettext('Publish'),
  [PostStatus.Private]: () => $gettext('Private'),
}

export const PostStatusOptions = [
  {
    label: $gettext('Draft'),
    value: PostStatus.Draft,
  },
  {
    label: $gettext('Publish'),
    value: PostStatus.Publish,
  },
  {
    label: $gettext('Private'),
    value: PostStatus.Private,
  },
]
