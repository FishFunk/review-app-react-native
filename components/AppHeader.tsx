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
            {
                <Button transparent onPress={props.onPressButton}>
                    <Icon name={props.buttonIconName} />
                </Button>
            }
            </Left>
            <Body>
                <Title>{props.title}</Title>
            </Body>
            <Right>
                {
                    props.rightButtonIconName ? 
                        <Button transparent onPress={(props.onPressRightButton)}>
                            <Icon name={props.rightButtonIconName}/>
                        </Button> : <Button transparent/>
                }
            </Right>
        </Header>
    );
}