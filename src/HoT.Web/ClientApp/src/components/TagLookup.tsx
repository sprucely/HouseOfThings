import React, { useRef } from 'react';
// @ts-ignore
import ReactTags, { Tag } from 'react-tag-autocomplete';

import './TagStyles.css';
import { TagModel } from '../types';
import Axios from 'axios';
import { none, useState } from '@hookstate/core';
import { clone } from '../utilities/state';
import { Ref } from 'semantic-ui-react';


type TagLookupProps = {
  onTagsChanged: (tags: TagModel[]) => void;
}


export const TagLookup = (props: TagLookupProps) => {
  const { onTagsChanged } = props;

  const tags = useState<TagModel[]>([]);
  const suggestions = useState<TagModel[]>([]);

  const searchTagsAsync = async (query: string) => {
    const result = await Axios.get<TagModel[]>("/api/tags/search?q=" + encodeURIComponent(query));
    return result.data || [];
  }

  const tagRef = useRef<ReactTags>(null);

  function handleDelete(i: number) {
    tags[i].set(none);
    onTagsChanged(tags.get());
  }

  function handleAddition(tag: Tag) {
    const tagClone = clone(tag) as Tag;
    tags.merge([tagClone]);
    onTagsChanged(tags.get());
  }

  return (
    <Ref innerRef={tagRef}>
      <ReactTags
        tags={tags.get()}
        suggestions={(!suggestions.promised && !suggestions.error && suggestions.get()) || []}
        onDelete={handleDelete}
        onAddition={handleAddition}
        onInput={(value: string) => { suggestions.set(searchTagsAsync(value)) }}
        inputWidth={20}
        autoResize={false}
        //tagComponent={TagComponent}
        //suggestionComponent={SuggestionComponent}
        classNames={{
          root: 'react-tags',
          rootFocused: 'is-focused',
          selected: 'react-tags__selected',
          selectedTag: 'ui button',//'react-tags__selected-tag',
          selectedTagName: 'react-tags__selected-tag-name',
          search: 'react-tags__search',
          //searchWrapper: 'react-tags__search-wrapper',
          searchInput: 'ui input focus', //'react-tags__search-input',
          suggestions: 'react-tags__suggestions',
          suggestionActive: 'is-active',
          suggestionDisabled: 'is-disabled'
        }} />
    </Ref>
  );
}
