import React from "react";
import { Dimensions, StyleSheet } from 'react-native';
import theme from "../../styles/theme";
import { Text, Title, View } from "native-base";
import AppHeader from "../AppHeader";
import { ScrollView } from "react-native-gesture-handler";

export default class LicenseAgreement extends React.Component<
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
        <Title style={{marginTop: 15, fontSize: 18, alignSelf: 'center'}}><Text>Software License Agreement</Text></Title>
        <Text style={styles.content}>
{`1. Under this Software License Agreement (the "Agreement"), Wanderlust Labs, LLC (the "Vendor") grants to the user (the "Licensee") a non-exclusive and non-transferable license (the "License") to use NoBull (the "Software").
2. "Software" includes the executable computer programs and any related printed, electronic and online documentation and any other files that may accompany the product.
3. Title, copyright, intellectual property rights and distribution rights of the Software remain exclusively with the Vendor. Intellectual property rights include the look and feel of the Software. This Agreement constitutes a license for use only and is not in any way a transfer of ownership rights to the Software.
4. The Software may be loaded onto no more than one computer. A single copy may be made for backup purposes only.
5. The rights and obligations of this Agreement are personal rights granted to the Licensee only. The Licensee may not transfer or assign any of the rights or obligations granted under this Agreement to any other person or legal entity. The Licensee may not make available the Software for use by one or more third parties.
6. The Software may not be modified, reverse-engineered, or de-compiled in any manner through current or future available technologies.
7. Failure to comply with any of the terms under the License section will be considered a material breach of this Agreement.`}</Text>

<Text style={styles.sectionHeader}>License Fee</Text>
<Text style={styles.content}>
{`8. The original purchase price paid by the Licensee will constitute the entire license fee and is the full consideration for this Agreement.
9. The Software is provided by the Vendor and accepted by the Licensee "as is". Liability of the Vendor will be limited to a maximum of the original purchase price of the Software. The Vendor will not be liable for any general, special, incidental or consequential damages including, but not limited to, loss of production, loss of profits, loss of revenue, loss of data, or any other business or economic disadvantage suffered by the Licensee arising out of the use or failure to use the Software.
10. The Vendor makes no warranty expressed or implied regarding the fitness of the Software for a particular purpose or that the Software will be suitable or appropriate for the specific requirements of the Licensee.
11. The Vendor does not warrant that use of the Software will be uninterrupted or error-free. The Licensee accepts that software in general is prone to bugs and flaws within an acceptable level as determined in the industry.`}
</Text>

<Text style={styles.sectionHeader}>Warrants and Representations</Text>
<Text style={styles.content}>
{`12. The Vendor warrants and represents that it is the copyright holder of the Software. The Vendor warrants and represents that granting the license to use this Software is not in violation of any other agreement, copyright or applicable statute.`}
</Text>

<Text style={styles.sectionHeader}>Acceptance</Text>
<Text style={styles.content}>
{`13. All terms, conditions and obligations of this Agreement will be deemed to be accepted by the Licensee ("Acceptance") on installation of the Software.
14. The term of this Agreement will begin on Acceptance and is perpetual.`}
</Text>

<Text style={styles.sectionHeader}>Termination</Text>
<Text style={styles.content}>
{`15. This Agreement will be terminated and the License forfeited where the Licensee has failed to comply with any of the terms of this Agreement or is in breach of this Agreement. On termination of this Agreement for any reason, the Licensee will promptly destroy the Software or return the Software to the Vendor.
16. The Vendor will be free of liability to the Licensee where the Vendor is prevented from executing its obligations under this Agreement in whole or in part due to Force Majeure, such as earthquake, typhoon, flood, fire, and war or any other unforeseen and uncontrollable event where the Vendor has taken any and all appropriate action to mitigate such an event.`}
</Text>

<Text style={styles.sectionHeader}>Governing Law</Text>
<Text style={styles.content}>
{`17. The Parties to this Agreement submit to the jurisdiction of the courts of the District of Columbia for the enforcement of this Agreement or any arbitration award or decision arising from this Agreement. This Agreement will be enforced or construed according to the laws of the District of Columbia.
18. This Agreement can only be modified in writing signed by both the Vendor and the Licensee.
19. This Agreement does not create or imply any relationship in agency or partnership between the Vendor and the Licensee.
20. Headings are inserted for the convenience of the parties only and are not to be considered when interpreting this Agreement. Words in the singular mean and include the plural and vice versa. Words in the masculine gender include the feminine gender and vice versa. Words in the neuter gender include the masculine gender and the feminine gender and vice versa.
21. If any term, covenant, condition or provision of this Agreement is held by a court of competent jurisdiction to be invalid, void or unenforceable, it is the parties' intent that such provision be reduced in scope by the court only to the extent deemed necessary by that court to render the provision reasonable and enforceable and the remainder of the provisions of this Agreement will in no way be affected, impaired or invalidated as a result.
22. This Agreement contains the entire agreement between the parties. All understandings have been included in this Agreement. Representations which may have been made by any party to this Agreement may in some way be inconsistent with this final written Agreement. All such statements are declared to be of no value in this Agreement. Only the written terms of this Agreement will bind the parties.
23. This Agreement and the terms and conditions contained in this Agreement apply to and are binding upon the Vendor's successors and assigns.
24. All notices to the Vendor under this Agreement are to be provided at the following address: Wanderlust Labs, LLC: 1032 15th St. NW #244, Washington DC, 20005`}
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