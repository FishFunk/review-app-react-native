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
import Logo from './Logo';

export default function AppHeader(props: any) {
    const fontSize = props.fontSize ? props.fontSize : 24;
    return (
        <Header style={{backgroundColor: theme.LIGHT_COLOR, ...props.headerStyles }}>
            <Left>
            {
                <Button transparent onPress={props.onPressButton}>
                    <Icon type={'FontAwesome5'} name={props.buttonIconName} 
                        style={{fontSize: fontSize, color:theme.PRIMARY_COLOR}}/>
                </Button>
            }
            </Left>
            <Body>
                {
                    props.title ? <Title>{props.title}</Title> : <Logo/>
                }
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