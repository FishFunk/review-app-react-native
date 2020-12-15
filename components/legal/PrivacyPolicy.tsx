import React from "react";
import { Dimensions, StyleSheet } from 'react-native';
import theme from "../../styles/theme";
import { Text, Title, View } from "native-base";
import AppHeader from "../AppHeader";
import { ScrollView } from "react-native-gesture-handler";

export default class PrivacyPolicy extends React.Component<
    {
        onDismissModal: () => any
    }>{

    render(){
        return (
<View style={styles.container}>
<AppHeader 
    fontSize={18}
    headerStyles={{ height: 32 }}
    onPressButton={this.props.onDismissModal.bind(this)} 
    buttonIconName={'times'}/>
        <ScrollView style={{}}>
        <Title style={{marginTop: 15, fontSize: 18}}><Text>Privacy Policy</Text></Title>
        <Text style={styles.sectionHeader}>LAST UPDATE: 11/24/2020</Text>
        <Text style={styles.content}>
{`Wanderlust Labs, LLC built the NoBull app as a Free app. 
This SERVICE is provided by Wanderlust Labs, LLC at no cost and is intended for use as is. 
This page is used to inform visitors regarding our policies with the collection, use, and disclosure 
of Personal Information if anyone decided to use our Service. If you choose to use our Service, 
then you agree to the collection and use of information in relation to this policy. 
The Personal Information that we collect is used for providing functionality and improving the Service. 
We will not use or share your information with anyone except as described in this Privacy Policy. 
The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, 
which is accessible at NoBull unless otherwise defined in this Privacy Policy.`}</Text>

<Text style={styles.sectionHeader}>INFORMATION COLLECTION AND USE</Text>
<Text style={styles.content}>
{`For a better experience, while using our Service, we may require you to provide us with certain 
personally identifiable information, including but not limited to First Name, Last Name, Email, 
Contacts, Facebook Public Profile, or Google Public Profile. The information that we request will 
be retained by us and used as described in this privacy policy. 
The app does use third party services that may collect information used to identify you. 
Third party service providers used by the app:\n\n

Google Play Services\n
Firebase Analytics\n
Facebook\n
Google\n\n

We want to inform you that whenever you use our Service, in a case of an error in the app we 
collect data and information (through third party products) on your phone called Log Data. 
This Log Data may include information such as your device Internet Protocol (“IP”) address, 
device name, operating system version, the configuration of the app when utilizing our Service, 
the time and date of your use of the Service, and other statistics.`}
</Text>

<Text style={styles.sectionHeader}>DATA DELETION RIGHTS</Text>
<Text style={styles.content}>
{`You have the right to request that we delete any of personal data related to you that we have 
collected from you. Upon confirmation of your request, we will delete – and direct our service 
providers to delete – personal data related to you from our records, unless retaining the 
information is necessary for us or for our service providers to complete the transaction with 
you, detect security incidents, identify and repair errors, exercise free speech or another 
right provided by law, comply with specific laws or legal obligations or any other internal and 
lawful use.`}
</Text>

<Text style={styles.sectionHeader}>EXERCISING DATA ACCESS AND DELETION RIGHTS</Text>
<Text style={styles.content}>
{`In order to exercise your access, data portability and deletion privacy rights, as described above, 
please submit a request here: https://nobullreviews.app/?target=contact or email us at: dev.wanderlustlabs@gmail.com. \n\n

Only you or a person authorized to act on your behalf, can make a request related to personal data related to you. 
You can also submit a request on behalf of your minor child. Please note that a request for access can be made by 
you only twice within a 12-month period. We will need to ask you to provide us with credentials to verify your 
identity or authority, address your request, and confirm the personal data relates to you. Note that we will only 
use the personal data provided in your request to verify your identity or authority and address your request.
We will do our best to respond to your request within 45 days of its receipt. If we require more time 
(up to additional 45 days), we will inform you of the reason and extension period. The response we provide will also 
explain the reasons we cannot comply with a request, where applicable. We do not charge a fee to process or respond 
to your request unless it is excessive, repetitive or manifestly unfounded. If we determine that the request warrants 
a fee, we will inform you of the reasons for such decision and provide you with a cost estimate before completing your request.`}
</Text>

<Text style={styles.sectionHeader}>COOKIES</Text>
<Text style={styles.content}>
{`Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. 
These are sent to your browser from the websites that you visit and are stored on your device's internal 
memory. This Service does not use these “cookies” explicitly. However, the app may use third party code 
and libraries that use “cookies” to collect information and improve their services. 
You have the option to either accept or refuse these cookies and know when a cookie is being sent to 
your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.`}
</Text>

<Text style={styles.sectionHeader}>SERVICE PROVIDERS</Text>
<Text style={styles.content}>
{`We may employ third-party companies and individuals due to the following reasons:
To facilitate our Service;
To provide the Service on our behalf;
To perform Service-related services; or
To assist us in analyzing how our Service is used.
We want to inform users of this Service that these third parties have access to your Personal Information. 
The reason is to perform the tasks assigned to them on our behalf. However, they are obligated 
not to disclose or use the information for any other purpose.`}
</Text>

<Text style={styles.sectionHeader}>SECURITY</Text>
<Text style={styles.content}>
{`We value your trust in providing us your Personal Information, 
thus we are striving to use commercially acceptable means of protecting it. 
But remember that no method of transmission over the internet, or method of electronic 
storage is 100% secure and reliable, and we cannot guarantee its absolute security.`}
</Text>

<Text style={styles.sectionHeader}>LINKS TO OTHER SITES</Text>
<Text style={styles.content}>
{`This Service may contain links to other sites. If you click on a third-party link, you will be 
directed to that site. Note that these external sites are not operated by us. 
Therefore, we strongly advise you to review the Privacy Policy of these websites. 
We have no control over and assume no responsibility for the content, privacy policies, 
or practices of any third-party sites or services.`}
</Text>

<Text style={styles.sectionHeader}>CHILDREN'S PRIVACY</Text>
<Text style={styles.content}>
{`These Services do not address anyone under the age of 13. We do not knowingly collect personally 
identifiable information from children under 13. In the case we discover that a child under 13 has 
provided us with personal information, we immediately delete this from our servers. 
If you are a parent or guardian and you are aware that your child has provided us with personal 
information, please contact us so that we will be able to do necessary actions.`}
</Text>

<Text style={styles.sectionHeader}>CHANGES TO THIS PRIVACY POLICY</Text>
<Text style={styles.content}>
{`We may update our Privacy Policy from time to time. Thus, you are advised to review this page 
periodically for any changes. We will notify you of any changes by posting the new Privacy Policy 
on this page. These changes are effective immediately after they are posted on this page.`}
</Text>

<Text style={styles.sectionHeader}>CONTACT US</Text>
<Text style={styles.content}>
{`If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.`}
</Text>
</ScrollView>
</View>)
    }
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('screen').height - 100
    },
    sectionHeader: {
        fontSize: 16,
        fontFamily: theme.fontBold,
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center'
    },
    content: {
        fontSize: 14,
        margin: 10,
        textAlign: 'justify'
    }
});