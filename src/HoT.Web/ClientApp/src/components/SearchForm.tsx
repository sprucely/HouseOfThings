import React, { useRef } from 'react';
import { none, useState } from '@hookstate/core';
import { Label, Search, SearchProps, Ref, Table, Icon, Input, Radio, Checkbox, Segment, Form } from 'semantic-ui-react';
import { useDebouncedCallback } from 'use-debounce';

import { TagModel, TagSuggestionModel } from '../types';
import { searchTagsAsync } from '../services/data';


export type SearchData = {
  tags: TagModel[];
  search: 'locations' | 'items';
  match: 'all' | 'any';
};

type SearchFormProps = {
  onSearchDataChanged: (data: SearchData) => void;
}

export const SearchForm = (props: SearchFormProps) => {
  const { onSearchDataChanged } = props;

  const tags = useState<TagModel[][]>([[], []]);
  const suggestions = useState<TagSuggestionModel[]>([]);
  const value = useState("");
  const ref = useRef<HTMLElement>(null);
  const search = useState<'locations' | 'items'>('locations');
  const match = useState<'all' | 'any'>('all');

  function collectSearchData() {
    return {
      tags: [...tags[0].value, ...tags[1].value] as TagModel[],
      search: search.get(),
      match: match.get()
    }
  }

  const handleSearchInputChange = useDebouncedCallback((query: string) => {
    suggestions.set(searchTagsAsync(query).then(
      results => (results
        .map(t => ({ id: t.id, title: t.name } as TagSuggestionModel))
        .filter(tag => !tags[0].some(tag2 => tag2.id.get() === tag.id)
          && !tags[1].some(tag2 => tag2.id.get() === tag.id)))
    ))
  }, 250);

  function handleDeleteTag(i: number, j: number) {
    tags[i][j].set(none);

    const data = collectSearchData();

    onSearchDataChanged(data);
    if (ref.current) {
      (ref.current.children[0].children[1] as HTMLElement)?.focus();
    }
  }

  function handleAddTag(_: any, { result }: { result: TagSuggestionModel }) {
    const tag = { id: result.id, name: result.title } as TagModel;
    const row0Length = tags[0].value.reduce((acc, t) => acc + t.name, "").length;
    const row1Length = tags[1].value.reduce((acc, t) => acc + t.name, "").length;

    if (row0Length <= row1Length) {
      tags[0].merge([tag])
    } else {
      tags[1].merge([tag])
    }

    const data = collectSearchData();

    onSearchDataChanged(data);
    const i = suggestions.findIndex(suggestion => suggestion.id.get() === result.id);
    if (i > -1) {
      suggestions[i].set(none);
    }
  }

  function handleSearchChange(newValue: 'locations' | 'items') {
    if (newValue !== search.get()) {
      search.set(newValue);
      const data = collectSearchData();
      onSearchDataChanged(data);
    }
  }

  function handleMatchChange(newValue: 'all' | 'any') {
    if (newValue !== match.get()) {
      match.set(newValue);
      const data = collectSearchData();
      onSearchDataChanged(data);
    }
  }

  const tagLabels = (<div>
    {[0, 1].map((i) =>
      <div key={i}>
        {tags[i].keys.map((j) => (
          <Label
            circular
            size={'small'}
            key={j}
            style={{ cursor: 'pointer' }}
            onClick={() => handleDeleteTag(i, j)}
          >{tags[i][j].name.get()}
          </Label>
        ))}
      </div>
    )}
  </div>);

  return (
    <Table basic attached collapsing textAlign='left'>
      <Table.Row>
        <Table.Cell>
          <Ref innerRef={ref}>
            <Search
              size='mini'
              aligned=''
              input={<Input iconPosition='left'>
                <Icon name='search' />
                <input placeholder='Search' />
                <div style={{ display: 'flex' }}>
                  {tagLabels}

                </div>
              </Input>}
              loading={suggestions.promised}
              onResultSelect={handleAddTag}
              onSearchChange={(_, data: SearchProps) => {
                value.set(data.value || "");
                handleSearchInputChange.callback(data.value || "")
              }}
              results={(!suggestions.promised && !suggestions.error && suggestions.get()) || []}
              value={value.get()}
              noResultsMessage={suggestions.promised ? 'Searching' : 'No Tags Found'}
              autoFocus
            />
          </Ref>
        </Table.Cell>
        <Table.Cell>
          <Form inverted>
            <div><Checkbox radio checked={search.get() === 'locations'} label='Locations' onClick={() => handleSearchChange('locations')} /></div>
            <div><Checkbox radio checked={search.get() === 'items'} label='Things' onClick={() => handleSearchChange('items')} /></div>
          </Form>
        </Table.Cell>
        <Table.Cell>
          <Form inverted>
            <div><Checkbox radio checked={match.get() === 'all'} label='Match All' onClick={() => handleMatchChange('all')} /></div>
            <div><Checkbox radio checked={match.get() === 'any'} label='Match Any' onClick={() => handleMatchChange('any')} /></div>
          </Form>
        </Table.Cell>
      </Table.Row>
    </Table>
  );
}
