import { State, useState } from '@hookstate/core';
import React, { ChangeEvent } from 'react';
import { Form, Input, Segment } from 'semantic-ui-react';

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

  async function handleImagesAdded(files: FileList | null) {
    if (!files)
      return;

    try {
      for (let i = 0; i < files.length; i++) {
        const photo = { name: item.name.get() || files[i].name } as EditPhotoModel;
        photo.image = (await resize(files[i], 1024, 1024, 95, 'blob', 200, 200)) as Blob;
        photo.thumbnail = (await resize(files[i], 150, 150, 95, 'blob', 50, 50)) as Blob;
        //let uri = URL.createObjectURL(blob);
        creatingPhotos.push(photo);
      }
    } catch (err) {
      console.log(err)
    }
  }

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
        <Form.Group>
          <Form.Field
            width={16}
            control={Input}
            type='file'
            accept='image/*'
            label='Image'
            multiple
            onChange={(e: ChangeEvent) => handleImagesAdded((e.target as HTMLInputElement).files)}
          />
          {/* <ImageUploader
            {...props}
            withIcon={true}
            onChange={handleImageDrop}
            imgExtension={[".jpg", ".jpeg"]}
            maxFileSize={10485760}
          /> */}
        </Form.Group>
      </Form>
    </Segment>
  )
}