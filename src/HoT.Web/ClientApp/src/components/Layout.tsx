import React from 'react';
import { Container } from 'semantic-ui-react';

import { NavMenu } from './NavMenu';

export const Layout = (props: any) => {
  const { children } = props;
  return (
    <Container style={{ marginTop: '3em' }}>
      {/* <NavMenu /> */}
      {children}
    </Container>
  );
}
