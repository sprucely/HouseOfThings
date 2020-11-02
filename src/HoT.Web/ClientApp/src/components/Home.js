import React, { useState, useRef } from 'react';
import ReactTags from 'react-tag-autocomplete'

function TagComponent({ tag, removeButtonText, onDelete }) {
  return (
    <button type='button' title={removeButtonText} onClick={onDelete}>
      {tag.name}
    </button>
  )
}

function SuggestionComponent({ item, query }) {
  return (
    <span id={item.id} className={item.name === query ? 'match' : 'no-match'}>
      {item.name}
    </span>
  )
}

export const Home = () => {

  const [tags, setTags] = useState([
    { id: 1, name: "Apples" },
    { id: 2, name: "Pears" }
  ]);

  const [suggestions, setSuggestions] = useState([
    { id: 3, name: "Bananas" },
    { id: 4, name: "Mangos" },
    { id: 5, name: "Lemons" },
    { id: 6, name: "Apricots" }
  ]);

  const tagRef = useRef();

  function handleDelete (i) {
    const newTags = tags.slice(0);
    newTags.splice(i, 1);
    setTags(newTags);
  }

  function handleAddition (tag) {
    setTags([...tags, tag])
  }

  return (
    <div>
      <h1>Hello, worldly!</h1>
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
          searchWrapper: 'react-tags__search-wrapper',
          searchInput: 'ui input focus', //'react-tags__search-input',
          suggestions: 'react-tags__suggestions',
          suggestionActive: 'is-active',
          suggestionDisabled: 'is-disabled'
        }} />
    </div>
  );
}
