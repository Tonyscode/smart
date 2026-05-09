const domain = new URL(process.env.SMART_BASE_URL!).hostname;
const maintanance_key = process.env.SMART_MAINTENANCE_KEY;

export function cookieSetup() {
    const staticCookies = [
        {
            "name": "Maintenance-Key",
            "value": maintanance_key,
            "domain": domain,
            "path": "/",
            "expires": -1,
            "httpOnly": false,
            "secure": false,
            "sameSite": "Lax"
        },
        {
            "name": "environment",
            "value": "stg",
            "domain": domain,
            "path": "/",
            "expires": -1,
            "httpOnly": false,
            "secure": true,
            "sameSite": "Lax"
        },
        {
            "name": "__hstc",
            "value": "113026587.47c309514868980ce42d4595957663b8.1778180005075.1778180005075.1778180005075.1",
            "domain": ".byggfakta.se",
            "path": "/",
            "expires": 1793732006,
            "httpOnly": false,
            "secure": false,
            "sameSite": "Lax"
        },
        {
            "name": "hubspotutk",
            "value": "47c309514868980ce42d4595957663b8",
            "domain": ".byggfakta.se",
            "path": "/",
            "expires": 1793732006,
            "httpOnly": false,
            "secure": false,
            "sameSite": "Lax"
        },
        {
            "name": "__hssrc",
            "value": "1",
            "domain": ".byggfakta.se",
            "path": "/",
            "expires": -1,
            "httpOnly": false,
            "secure": false,
            "sameSite": "Lax"
        },
        {
            "name": "__hssc",
            "value": "113026587.2.1778180005075",
            "domain": ".byggfakta.se",
            "path": "/",
            "expires": 1778181806,
            "httpOnly": false,
            "secure": false,
            "sameSite": "Lax"
        },
        {
            "name": "__cf_bm",
            "value": "54Wm52V2C_2.lb6oomvGELgLp_z7WIGYOjXalnoD1Xo-1778180005-1.0.1.1-rKed2ts_MT1TDTSR11CctkR9NKWUl2I3jO0cUGLfVFinOvtY8bt2dzB7jy4OHMDbEPEG38UIEb.1p3qvt78l0ViC_bv5OB0bY3zZNcFJyH4",
            "domain": ".hubspot.com",
            "path": "/",
            "expires": 1778181806.393531,
            "httpOnly": true,
            "secure": true,
            "sameSite": "None"
        },
        {
            "name": "_cfuvid",
            "value": "ZZ1EI0.G_9x15j_P_chWukf0pFW3cHxeZrDardcy5nk-1778180005321-0.0.1.1-604800000",
            "domain": ".hubspot.com",
            "path": "/",
            "expires": -1,
            "httpOnly": true,
            "secure": true,
            "sameSite": "None"
        },
        {
            "name": "ph_phc_7LEjVli0zjqteyNMxuv3Q4eEAK3dVbXPyp01D3KBAK9_posthog",
            "value": "%7B%22%24device_id%22%3A%22019e03c9-9bb9-7e28-8a9a-cb074f9ffd97%22%2C%22distinct_id%22%3A%22795%22%2C%22%24epp%22%3Atrue%2C%22%24user_state%22%3A%22identified%22%7D",
            "domain": ".byggfakta.se",
            "path": "/",
            "expires": 1809716009,
            "httpOnly": false,
            "secure": true,
            "sameSite": "Lax"
        },
        {
            "name": "_ga_YBZV6MYM52",
            "value": "GS2.1.s1778180006$o1$g1$t1778180009$j59$l0$h0",
            "domain": ".byggfakta.se",
            "path": "/",
            "expires": 1812740009.929385,
            "httpOnly": false,
            "secure": false,
            "sameSite": "Lax"
        },
        {
            "name": "_ga",
            "value": "GA1.1.198",
            "domain": ".byggfakta.se",
            "path": "/",
            "expires": 1812740009.929648,
            "httpOnly": false,
            "secure": false,
            "sameSite": "Lax"
        }
    ]

    return staticCookies
}

export function origins() {

    return [
        {
            "origin": process.env.SMART_BASE_URL!,
            "localStorage": [
                {
                    "name": "LUMINANCE",
                    "value": "bright"
                },
                {
                    "name": "ph_phc_7LEjVli0zjqteyNMxuv3Q4eEAK3dVbXPyp01D3KBAK9_posthog",
                    "value": "{\"$user_state\":\"identified\",\"distinct_id\":\"4839\",\"$device_id\":\"019e03c9-9bb9-7e28-8a9a-cb074f9ffd97\",\"$last_posthog_reset\":\"2026-05-07T18:53:29.921Z\",\"$epp\":true,\"$user_id\":\"795\",\"$stored_person_properties\":{\"user_market\":\"se\",\"language\":\"en\"},\"journey_id\":\"e0f20524-06e3-43e9-8ab6-e81c43192e1b\",\"$feature_flag_errors\":[],\"$active_feature_flags\":[],\"$enabled_feature_flags\":{},\"$feature_flag_payloads\":{},\"$feature_flag_details\":{},\"$feature_flag_request_id\":\"7b51bcd7-4ddc-4e7d-9dad-60049d0d2ffc\",\"$feature_flag_evaluated_at\":1778180008904}"
                },
                {
                    "name": "privacy-consent",
                    "value": "true"
                },
                {
                    "name": "__ph_opt_in_out_phc_7LEjVli0zjqteyNMxuv3Q4eEAK3dVbXPyp01D3KBAK9",
                    "value": "1"
                },
                {
                    "name": "PersistedStorage",
                    "value": "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"
                },
                {
                    "name": "LANG_ID",
                    "value": "1"
                }
            ]
        }]
}
