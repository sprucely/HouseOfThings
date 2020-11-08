import useAxios from 'axios-hooks';
import React, { useState, useRef } from 'react';
// @ts-ignore
import ReactTags, { Tag } from 'react-tag-autocomplete';
import './TagStyles.css';


export type TagModel = {
  id: number,
  name: string
}

type TagLookupProps = {
  onTagsChanged: (tags: TagModel[]) => void;
}


export const TagLookup = (props : TagLookupProps) => {
  const { onTagsChanged } = props;

  const [tags, setTags] = useState<TagModel[]>([]);

  const [tagQuery, setTagQuery] = useState("");

  const [{ data: suggestions }] = useAxios<TagModel[]>('/api/tags/search?q=' + encodeURIComponent(tagQuery))

  console.log(suggestions);

  const tagRef = useRef<ReactTags>(null);

  function handleDelete(i: number) {
    const newTags = tags.slice(0);
    newTags.splice(i, 1);
    setTags(newTags);
    onTagsChanged(newTags);
  }

  function handleAddition(tag: Tag) {
    const newTags = [...tags, tag];
    setTags(newTags);
    onTagsChanged(newTags);
  }

  function handleInput(query: string) {
    setTagQuery(query);
  }

  return (
    <ReactTags
      ref={tagRef}
      tags={tags}
      suggestions={suggestions}
      onDelete={handleDelete}
      onAddition={handleAddition}
      onInput={handleInput}
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
  );
}
