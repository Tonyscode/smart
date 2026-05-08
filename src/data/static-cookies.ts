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
                    "value": "{\"$user_state\":\"identified\",\"distinct_id\":\"795\",\"$device_id\":\"019e03c9-9bb9-7e28-8a9a-cb074f9ffd97\",\"$last_posthog_reset\":\"2026-05-07T18:53:29.921Z\",\"$epp\":true,\"$user_id\":\"795\",\"$stored_person_properties\":{\"user_market\":\"se\",\"language\":\"en\"},\"journey_id\":\"e0f20524-06e3-43e9-8ab6-e81c43192e1b\",\"$feature_flag_errors\":[],\"$active_feature_flags\":[],\"$enabled_feature_flags\":{},\"$feature_flag_payloads\":{},\"$feature_flag_details\":{},\"$feature_flag_request_id\":\"7b51bcd7-4ddc-4e7d-9dad-60049d0d2ffc\",\"$feature_flag_evaluated_at\":1778180008904}"
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
