const core = require('@actions/core');
const github = require('@actions/github');
const Fs = require("fs/promises");
const fetch = require("node-fetch");


async function apiCall(api, body) {
    const url = `https://library.jmonkeyengine.org/${api}`;
    // console.info("Fetch ", url, "with payload", body);
    const data = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => res.json());
    // console.info("Response", data);
    if (data.error) throw data.error;
    return data;

}

async function main() {
    try {
        const data = {};
        if (core.getInput('data')) {
            const inputData = JSON.parse(await Fs.readFile(core.getInput('data')));
            for (const [k, v] of Object.entries(inputData)) {
                if (v.value) data[k] = v.value;
                else data[k] = v;
            }
        }

        const media = [];
        let lastMediaId = 0;
        if (core.getInput('media-data-array')) {
            const inputMediaR = JSON.parse(await Fs.readFile(core.getInput('media-data-array')));
            for (const inputMedia of inputMediaR) {
                const newMedia = {};
                for (const [k, v] of Object.entries(inputMedia)) {
                    if (v.value) newMedia[k] = v.value;
                    else newMedia[k] = v;
                }
                newMedia.mediaId=lastMediaId;
                lastMediaId++;
                media.push(newMedia);
            }
        }

        const userId = core.getInput('userId');
        const token = core.getInput('token');
        const authKey = core.getInput('authKey');
        const authId = core.getInput('authId');
        
        let repo = core.getInput('fetch-repo') ? (core.getInput('fetch-repo') == "current" ? github.context.repo : core.getInput('fetch-repo')) : undefined;
        if(repo=="nil"||repo=="null"||repo=="undefined") repo=undefined;
        
        let ref = undefined;
        if(core.getInput('ref'))ref=core.getInput('ref');
        else {
            if(github.context.ref){
                const refpath=github.context.ref;
                ref=refpath.substring(refpath.lastIndexOf("/")+1);
            }            
            if(!ref)ref=github.context.branch;
        } 
        console.info("Publish ref",ref);

        if (repo) {
            // import entry data
            const importedEntry = await apiCall("ext-import/github/entry", {
                repo: `${repo.owner}/${repo.repo}`,
                userId: userId,
                token: token,
                ref: ref
            });
            for (const [key, value] of Object.entries(importedEntry)) {
                if(key=="platforms")continue; // hot fix, don't replace specified platforms
                if (!data[key]) data[key] = value;
            }


            // import media
            const importedMedia = [];
            {
                for (let mediaId = 0; ; mediaId++) {
                    try {
                        const mediaData = await apiCall("ext-import/github/media", {
                            repo: `${repo.owner}/${repo.repo}`,
                            userId: userId,
                            token: token,
                            mediaId: mediaId,
                            ref: ref
                        });
                        mediaData.mediaId=lastMediaId;
                        lastMediaId++;
                        importedMedia.push(mediaData);
                    } catch (e) {
                        break;
                    }
                }
                importedMedia.forEach(m => {if(m) media.push(m)});
            }

        }

        let entryId = data.entryId;
        if(core.getInput('entryId')){
            entryId=core.getInput('entryId');
        }

        let funding = undefined;
        if(typeof core.getInput('funding')!="undefined"){
            funding=Boolean(core.getInput('funding'));
        }

        let platforms = undefined;
        if(typeof core.getInput('platforms')!="undefined"){
            platforms=core.getInput('platforms').split(",").map(p=>p.trim());
        }

        // Publish
        {
            // Fetch old data
            try {
                let oldData = await apiCall("entry/get", {
                    userId: userId,
                    entryId: entryId,
                    authId: authId,
                    authKey: authKey
                });

                for (const [key, value] of Object.entries(oldData)) {
                    if (!data[key]) {
                        data[key] = value;
                    }
                }

            } catch (e) {
                console.error(e);
            }

            // Update with new data
            {
                console.info("Set entry",data.entryId);
                data.authId = authId;
                data.authKey = authKey;
                data.entryId = entryId;
                if(typeof funding!="undefined") data.funding = funding;
                if(typeof platforms!="undefined") data.platforms = platforms;
                data.suspended = "Updating..."; // suspend during update
                await apiCall("entry/set", data);
            }
        }

        // update media
        for (const mediaData of media) {
            console.info("Set media",mediaData.mediaId, "for entry",data.entryId);
            try{
                mediaData.entryId = entryId;
                mediaData.authId = authId;
                mediaData.authKey = authKey;
                await apiCall("media/set", mediaData);
            }catch(e){
                console.error(e);
            }
        }


        // publish entry
        {
            console.info("Publish entry",data.entryId);
            data.suspended = undefined;
            await apiCall("entry/set", data);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}
main();