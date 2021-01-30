import { State, useState } from '@hookstate/core';
import React, { ChangeEvent, useRef } from 'react';
import { Card, Form, Input, Segment, Image, Button, Grid } from 'semantic-ui-react';

import { EditPhotoModel, ItemModel } from '../types';
import { resize } from '../utilities/images';

type EditItemProps = {
  item: State<ItemModel>
}

export const creatingPhotos: EditPhotoModel[] = [];
export const updatingPhotos: EditPhotoModel[] = [];

export function EditItem(props: EditItemProps) {
  const { item: _item } = props;

  const item = useState(_item);
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImagesAdded(files: FileList | null) {
    if (!files)
      return;

    try {
      for (let i = 0; i < files.length; i++) {
        const photo = { name: files[i].name.split('.').slice(0, -1).join('.') } as EditPhotoModel;
        photo.image = (await resize(files[i], 1024, 1024, 95, 'blob', 200, 200)) as Blob;
        photo.thumbnail = (await resize(files[i], 150, 150, 95, 'blob', 50, 50)) as Blob;
        creatingPhotos.push(photo);
        item.photos.merge([{ name: photo.name, itemId: item.id.get(), id: 0, url: URL.createObjectURL(photo.thumbnail) }])
      }
    } catch (err) {
      console.log(err)
    }
  }

  const photos = item.photos.keys.map(i => {
    const id = item.photos[i].id.get();
    const url = item.photos[i].url.get() || (id && `/api/photos/thumbnail/${id}`);

    return (
      <Card raised={false} key={i} >
        <div style={{
          display: 'flex',
          justifyContent: 'left',
          alignItems: 'center',
          width: '100px',
          height: '100px'
        }}>
          <Image src={url} size='small' style={{ objectFit: "contain" }} />
        </div>
        <input
          value={item.photos[i].name.get()}
          onChange={(e: ChangeEvent<HTMLInputElement>) => item.photos[i].name.set(e.target.value)}
        />
      </Card>
    );
  });

  return (
    <Segment basic>
      <Form>
        <Form.Group widths='equal'>
          <Form.Field
            control={Input}
            label='Location Name'
            placeholder='Location Name'
            value={item.name.get() || ""}
            onChange={(_: any, { value }: { value: string }) => item.name.set(value)}
            autoFocus
          />
        </Form.Group>
        <Form.Group>
          <Form.Field
            width={16}
            control={Input}
            label='Description'
            placeholder='Description'
            value={item.description.get() || ""}
            onChange={(_: any, { value }: { value: string }) => item.description.set(value)}
          />
        </Form.Group>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <div>
                <Card.Group itemsPerRow={6}>
                  {photos}
                  <Card raised={false}>
                    <Card.Content>
                      <Button icon='add' key='add' onClick={() => fileInputRef.current?.click()} />

                    </Card.Content>
                  </Card>
                </Card.Group>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <input
          type='file'
          multiple
          id='file'
          ref={fileInputRef}
          onChange={(e: ChangeEvent) => {
            handleImagesAdded((e.target as HTMLInputElement).files);
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{ display: 'none' }}
        />
        {/* <ImageUploader
            {...props}
            withIcon={true}
            onChange={handleImageDrop}
            imgExtension={[".jpg", ".jpeg"]}
            maxFileSize={10485760}
          /> */}
      </Form>
    </Segment>
  )
}