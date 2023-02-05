<template>
    <div class="setting">
        <div class="setting-name">{{ SettingName }}</div>
        <input type="number" :value="Value">
    </div>
</template>

<script>
    export default {
        name: "settings-component",
        props: {
            SettingName: String,
            Value: Number,
        },
        methods: {
        }
    }
</script>

<style>
    .setting-name {
        display: block;
        text-align: center;
    }
    .setting {
        width: 18vw;
    }
    input {
        width: 18vw;
    }
</style>