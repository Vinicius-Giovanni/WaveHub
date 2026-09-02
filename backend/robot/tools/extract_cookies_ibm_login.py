from __future__ import annotations
import json
import os

from backend.settings.elements_ibm import ELEMENTS_LOGIN
from backend.settings.paths import COOKIES_FILE
from backend.settings.variables import LOGIN_ADM, PASSWORD_ADM

class ExtractCookiesLoginIBM:

    async def login(page) -> list[dict]:

        # Direcionar para o IBM
        await page.goto(os.getenv('LINK_LOGIN_IBM'))

        # validate start window
        await page.locator(ELEMENTS_LOGIN['window_validation_login']).wait_for()

        # Dropdown Azure AD select
        await page.locator(
            ELEMENTS_LOGIN['namespace_dropdown_button']
        ).click()

        # Select Azure AD
        await page.locator(
            ELEMENTS_LOGIN['namespace_azuread']
        ).click()

        # Banner Microsoft
        await page.locator(
            ELEMENTS_LOGIN['element_banner']
        ).wait_for()

        # Send Email
        await page.fill(
            ELEMENTS_LOGIN['email'],
            LOGIN_ADM
        )

        # Confirm email
        await page.click(
            ELEMENTS_LOGIN['submit_button']
        )

        # Send Password
        await page.fill(
            ELEMENTS_LOGIN['password'],
            PASSWORD_ADM
        )

        # Confirm Password
        await page.click(
            ELEMENTS_LOGIN['submit_button']
        )

        # Connected
        await page.click(
            ELEMENTS_LOGIN['submit_button']
        )

        # validate pattern window
        await page.locator(
            ELEMENTS_LOGIN['element_button']
        ).wait_for()

        cookies = await page.context.cookies()

        with open(COOKIES_FILE, 'w', encoding='utf-8') as f:
            json.dump(cookies, f, indent=4)

        return cookies