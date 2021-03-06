import { getRandomString } from "@pnp/common";
import { expect } from "chai";
import { testSettings } from "../main";
import { graph } from "@pnp/graph";
import "@pnp/graph/teams";
import "@pnp/graph/groups";

// TODO:: skipping until we enable the test user settings
describe.skip("Teams", function () {

    if (testSettings.enableWebTests) {
        let teamID = "";
        let operationID = "";

        const sleep = (ms): Promise<void> => {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        };

        // tslint:disable:object-literal-sort-keys
        const teamBody = {
            "template@odata.bind": "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
            "displayName": "",
            "description": "PnPJS Test Team’s Description",
            "members": [
                {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    "roles": ["owner"],
                    "user@odata.bind": "https://graph.microsoft.com/v1.0/users('1d7f876a-49c2-4b05-8ca4-cb819ae840c4')",
                },
            ],
        };

        beforeEach(async function () {
            // Clear out groupID
            teamID = "";
            operationID = "";
        });

        it("createTeam()", async function () {
            const teamName = `TestTeam_${getRandomString(4)}`;
            teamBody.displayName = teamName;
            const teamCreateResult = await graph.teams.create(teamBody);
            teamID = teamCreateResult.teamId;
            operationID = teamCreateResult.operationId;
            return expect(teamID.length > 0).is.true;
        });

        afterEach(async function () {
            if (teamID !== "") {
                let isPending = true;
                while (isPending) {
                    const status = await graph.teams.getById(teamID).getOperationById(operationID);
                    isPending = (status.status === "inProgress");
                    if (isPending) {
                        await sleep(3000);
                    }
                }
                await graph.groups.getById(teamID).delete();
            }
        });
    }
});
