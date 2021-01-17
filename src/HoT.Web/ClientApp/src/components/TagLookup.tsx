import React, { useRef } from 'react';
import { none, useState } from '@hookstate/core';
import { Label, Search, SearchProps, Ref, Table, Icon, Input } from 'semantic-ui-react';
import { useDebouncedCallback } from 'use-debounce';

import { TagModel, TagSuggestionModel } from '../types';
import { searchTagsAsync } from '../services/data';


type TagLookupProps = {
  onTagsChanged: (tags: TagModel[]) => void;
}

export const TagLookup = (props: TagLookupProps) => {
  const { onTagsChanged } = props;

  const tags = useState<TagModel[][]>([[], []]);
  const suggestions = useState<TagSuggestionModel[]>([]);
  const value = useState("");
  const ref = useRef<HTMLElement>(null);

  const handleSearchChange = useDebouncedCallback((query: string) => {
    suggestions.set(searchTagsAsync(query).then(
      results => (results
        .map(t => ({ id: t.id, title: t.name } as TagSuggestionModel))
        .filter(tag => !tags[0].some(tag2 => tag2.id.get() === tag.id)
          && !tags[1].some(tag2 => tag2.id.get() === tag.id)))
    ))
  }, 250);

  function handleDeleteTag(i: number, j: number) {
    tags[i][j].set(none);

    const allTags: TagModel[] = [...tags[0].value, ...tags[1].value];

    onTagsChanged(allTags);
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

    const allTags: TagModel[] = [...tags[0].value, ...tags[1].value];

    onTagsChanged(allTags);
    const i = suggestions.findIndex(suggestion => suggestion.id.get() === result.id);
    if (i > -1) {
      suggestions[i].set(none);
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
                {tagLabels}
              </Input>}
              loading={suggestions.promised}
              onResultSelect={handleAddTag}
              onSearchChange={(_, data: SearchProps) => {
                value.set(data.value || "");
                handleSearchChange.callback(data.value || "")
              }}
              results={(!suggestions.promised && !suggestions.error && suggestions.get()) || []}
              value={value.get()}
              noResultsMessage={suggestions.promised ? 'Searching' : 'No Tags Found'}
              autoFocus
            />
          </Ref>
        </Table.Cell>
      </Table.Row>
    </Table>
  );
}
