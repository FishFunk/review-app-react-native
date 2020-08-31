import React from 'react';
import { 
    Header, 
    Title, 
    Left, 
    Icon, 
    Right, 
    Button, 
    Body
} from "native-base";

export default function AppHeader(props: any) {
    return (
        <Header>
            <Left>
            <Button transparent onPress={props.toggleDrawer}>
                <Icon name='menu' />
            </Button>
            </Left>
            <Body>
            <Title>Review App</Title>
            </Body>
            <Right>
            <Button transparent>
            </Button>
            </Right>
        </Header>
    );
}