import React, { useState, useRef } from 'react';
// @ts-ignore
import ReactTags, { Tag } from 'react-tag-autocomplete'

export const Home = () => {
  const [tags, setTags] = useState<Tag[]>([
    { id: 1, name: "Apples" },
    { id: 2, name: "Pears" }
  ]);

  const [suggestions] = useState<Tag[]>([
    { id: 3, name: "Bananas" },
    { id: 4, name: "Mangos" },
    { id: 5, name: "Lemons" },
    { id: 6, name: "Apricots" }
  ]);

  const tagRef = useRef<ReactTags>(null);

  function handleDelete (i: number) {
    const newTags = tags.slice(0);
    newTags.splice(i, 1);
    setTags(newTags);
  }

  function handleAddition (tag: Tag) {
    setTags([...tags, tag])
  }

  return (
    <div>
      <h1>Hello, worlds!</h1>
      <ReactTags
        ref={tagRef}
        tags={tags}
        suggestions={suggestions}
        onDelete={handleDelete}
        onAddition={handleAddition}
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
    </div>
  );
}
