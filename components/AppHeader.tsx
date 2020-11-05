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
import theme from '../styles/theme';

export default function AppHeader(props: any) {
    const fontSize = 24;
    return (
        <Header style={{backgroundColor: theme.LIGHT_COLOR}}>
            <Left>
            {
                <Button transparent onPress={props.onPressButton}>
                    <Icon type={'FontAwesome5'} name={props.buttonIconName} 
                        style={{fontSize: fontSize, color:theme.PRIMARY_COLOR}}/>
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
                            <Icon type={'FontAwesome5'} name={props.rightButtonIconName} 
                                style={{fontSize: fontSize, color:theme.PRIMARY_COLOR}}/>
                        </Button> : <Button transparent/>
                }
            </Right>
        </Header>
    );
}