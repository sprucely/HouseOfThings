import React, { useRef } from 'react';
import { none, useState } from '@hookstate/core';
import { Grid, Label, Search, SearchProps, Ref, Table } from 'semantic-ui-react';
import { useDebouncedCallback } from 'use-debounce';

import { TagModel, TagSuggestionModel } from '../types';
import { searchTagsAsync } from '../services/data';


type TagLookupProps = {
  onTagsChanged: (tags: TagModel[]) => void;
}

export const TagLookup = (props: TagLookupProps) => {
  const { onTagsChanged } = props;

  const tags = useState<TagModel[]>([]);
  const suggestions = useState<TagSuggestionModel[]>([]);
  const value = useState("");
  const ref = useRef<HTMLElement>(null);

  const handleSearchChange = useDebouncedCallback((query: string) => {
    suggestions.set(searchTagsAsync(query).then(
      results => (results
        .map(t => ({ id: t.id, title: t.name } as TagSuggestionModel))
        .filter(tag => !tags.some(tag2 => tag2.id.get() === tag.id)))
    ))
  }, 250);

  function handleDelete(i: number | null) {
    if (i === null) {
      // default to deleting last tag
      i = tags.length - 1;
      if (i < 0) return;
    }
    tags[i].set(none);
    onTagsChanged(tags.get());
    if (ref.current) {
      (ref.current.firstChild?.firstChild as HTMLElement)?.focus();
    }
  }

  function handleAddition(_: any, { result }: { result: TagSuggestionModel }) {
    const tag = { id: result.id, name: result.title } as TagModel;
    tags.merge([tag]);
    onTagsChanged(tags.get());
    const i = suggestions.findIndex(suggestion => suggestion.id.get() === result.id);
    if (i > -1) {
      suggestions[i].set(none);
    }
  }

  const search = (<Ref innerRef={ref}><Search
    aligned=''
    input={{ icon: 'search', iconPosition: 'left' }}
    loading={suggestions.promised}
    onResultSelect={handleAddition}
    onSearchChange={(_, data: SearchProps) => {
      value.set(data.value || "");
      handleSearchChange.callback(data.value || "")
    }}
    results={(!suggestions.promised && !suggestions.error && suggestions.get()) || []}
    value={value.get()}
    noResultsMessage={suggestions.promised ? 'Searching' : 'No Tags Found'}
    autoFocus
  /></Ref>);

  const tagLabels = (<Label.Group circular size='medium'>
    {tags.keys.map((i) => (
      <Label
        key={i}
        style={{ cursor: 'pointer' }}
        onClick={() => handleDelete(i)}

      >{tags[i].name.get()}</Label>
    ))}
  </Label.Group>);

  return (
    <Table inverted basic attached collapsing textAlign='left'>
      {!!tags.length
        ? (
          <>
            <Table.Row>
              <Table.Cell>
                {search}
              </Table.Cell>
            </Table.Row>
            <Grid.Row>
              <Grid.Column>
                {tagLabels}
              </Grid.Column>
            </Grid.Row>
          </>)
        : (
          <Table.Row>
            <Table.Cell>
              {search}
            </Table.Cell>
          </Table.Row>)}
    </Table>
  );
}
