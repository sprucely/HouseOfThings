import { none, State, useState } from '@hookstate/core';
import React, { ChangeEvent, useRef } from 'react';
import { Card, Form, Input, Segment, Image, Button, Grid, Label, Popup } from 'semantic-ui-react';

import { EditPhotoModel, ItemModel, PhotoModel } from '../types';
import { dataURItoBlob, resize } from '../utilities/images';
import { Camera } from './Camera';

type EditItemProps = {
  item: State<ItemModel>
}

type PhotoPreviewProps = {
  photo: State<PhotoModel>;
  onDeletePhoto: () => void;
}

export const creatingPhotos: EditPhotoModel[] = [];

function PhotoPreviewCard(props: PhotoPreviewProps) {
  const { photo, onDeletePhoto } = props;
  const id = photo.id.get();
  const url = photo.url.get() || (id && `/api/photos/thumbnail/${id}`);

  return (
    <Card raised={false} >
      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center',
        width: '100px',
        height: '100px'
      }}>
        <Popup content='Delete Photo' trigger={(<Label icon='delete' attached='top right' style={{ zIndex: '2', cursor: 'pointer' }} onClick={onDeletePhoto} />)} />
        <Image src={url} size='small' style={{ objectFit: "contain", zIndex: '1' }} ></Image>
      </div>
      <input
        value={photo.name.get()}
        onChange={(e: ChangeEvent<HTMLInputElement>) => photo.name.set(e.target.value)}
      />
    </Card>
  );

}

export function EditItem(props: EditItemProps) {
  const { item: _item } = props;

  const item = useState(_item);
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraActive = useState(false);

  async function handleImagesAdded(files: FileList | null) {
    if (!files)
      return;

    try {
      for (let i = 0; i < files.length; i++) {
        const photo = { name: files[i].name.split('.').slice(0, -1).join('.') } as EditPhotoModel;
        photo.image = (await resize(files[i], 1024, 1024, 95, 'blob', 200, 200)) as Blob;
        photo.thumbnail = (await resize(files[i], 150, 150, 95, 'blob', 50, 50)) as Blob;
        photo.photosIndex = item.photos.length;
        creatingPhotos.push(photo);
        item.photos.merge([{ name: photo.name, itemId: item.id.get(), id: 0, url: URL.createObjectURL(photo.thumbnail) }])
      }
    } catch (err) {
      console.log(err)
    }
  }

  async function handlePhotoCapture(dataUri: string) {
    cameraActive.set(false);
    const blob = dataURItoBlob(dataUri);
    const photo = { name: `img_${item.photos.length}` } as EditPhotoModel;
    photo.image = (await resize(blob, 1024, 1024, 95, 'blob', 200, 200)) as Blob;
    photo.thumbnail = (await resize(blob, 150, 150, 95, 'blob', 50, 50)) as Blob;
    photo.photosIndex = item.photos.length;
    creatingPhotos.push(photo);
    item.photos.merge([{ name: photo.name, itemId: item.id.get(), id: 0, url: URL.createObjectURL(photo.thumbnail) }])
  }

  function handleDeletePhoto(i: number) {
    const creatingIndex = creatingPhotos.findIndex(p => p.photosIndex === i);
    if (creatingIndex > -1) {
      creatingPhotos.splice(creatingIndex, 1);
    }
    item.photos[i].set(none);
    creatingPhotos.filter(p => p.photosIndex > i).forEach(p => p.photosIndex -= 1)
  }

  return (
    <Segment basic>
      <Form>
        <Form.Group widths='equal'>
          <Form.Field
            control={Input}
            label='Item Name'
            placeholder='Item Name'
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
                  {item.photos.keys.map(i => <PhotoPreviewCard photo={item.photos[i]} onDeletePhoto={() => handleDeletePhoto(i)} key={i} />)}
                  <Card raised={false} key='add'>
                    <Card.Content>
                      {/* click hidden file input to open file dialog */}
                      <Popup content='Add Photo' trigger={<Button icon='add' onClick={() => fileInputRef.current?.click()} />} />
                      <Popup content='Snap Photo' trigger={<Button icon='camera' onClick={() => cameraActive.set(true)} />} />
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
      </Form>
      {cameraActive.get() && <Camera onSnapPhoto={handlePhotoCapture} />}

    </Segment>
  )
}