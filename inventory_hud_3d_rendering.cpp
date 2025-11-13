// Consolidated reference for inventory HUD rendering, in-inventory 3D items, and selected item rotation.
// This file mirrors relevant client source logic for study purposes and is wrapped in #if 0 so it does not compile.

#if 0
// ===== Source Main 5.2/source/NewUIMyInventory.cpp : Render =====
bool SEASON3B::CNewUIMyInventory::Render()
{
        EnableAlphaTest();
        glColor4f(1.0f, 1.0f, 1.0f, 1.0f);
        RenderFrame();
        RenderInventoryDetails();
        RenderSetOption();
        RenderSocketOption();
        RenderButtons();

        if(m_pNewInventoryCtrl)
                m_pNewInventoryCtrl->Render();

        RenderEquippedItem();
        DisableAlphaBlend();
        return true;
}

// ===== Source Main 5.2/source/NewUIMyInventory.cpp : RenderFrame / RenderInventoryDetails =====
void SEASON3B::CNewUIMyInventory::RenderFrame()
{
        RenderImage(IMAGE_INVENTORY_BACK, m_Pos.x, m_Pos.y, 190.f, 429.f);
        RenderImage(IMAGE_INVENTORY_BACK_TOP2, m_Pos.x, m_Pos.y, 190.f, 64.f);
        RenderImage(IMAGE_INVENTORY_BACK_LEFT, m_Pos.x, m_Pos.y+64, 21.f, 320.f);
        RenderImage(IMAGE_INVENTORY_BACK_RIGHT, m_Pos.x+INVENTORY_WIDTH-21, m_Pos.y+64, 21.f, 320.f);
        RenderImage(IMAGE_INVENTORY_BACK_BOTTOM, m_Pos.x, m_Pos.y+INVENTORY_HEIGHT-45, 190.f, 45.f);
}

void SEASON3B::CNewUIMyInventory::RenderInventoryDetails()
{
        EnableAlphaTest();

        g_pRenderText->SetFont(g_hFontBold);
        g_pRenderText->SetBgColor(0);
        g_pRenderText->SetTextColor(255, 255, 255, 255);
        g_pRenderText->RenderText(m_Pos.x,m_Pos.y+12,GlobalText[223], INVENTORY_WIDTH, 0, RT3_SORT_CENTER);

        RenderImage(IMAGE_INVENTORY_MONEY, m_Pos.x+11, m_Pos.y+364, 170.f, 26.f);

        DWORD dwZen = CharacterMachine->Gold;

        unicode::t_char Text[256] = { 0, };
        ConvertGold(dwZen, Text);

        g_pRenderText->SetTextColor(getGoldColor(dwZen));
        g_pRenderText->RenderText((int)m_Pos.x+50,(int)m_Pos.y+371, Text);

        g_pRenderText->SetFont(g_hFont);

        DisableAlphaBlend();
}

// ===== Source Main 5.2/source/NewUIMyInventory.cpp : RenderButtons =====
void SEASON3B::CNewUIMyInventory::RenderButtons()
{
        EnableAlphaTest();

        if (g_pNewUISystem->IsVisible(SEASON3B::INTERFACE_NPCSHOP)==false
                && g_pNewUISystem->IsVisible(SEASON3B::INTERFACE_TRADE)==false
                && g_pNewUISystem->IsVisible(SEASON3B::INTERFACE_DEVILSQUARE)==false
                && g_pNewUISystem->IsVisible(SEASON3B::INTERFACE_BLOODCASTLE)==false
                && g_pNewUISystem->IsVisible(SEASON3B::INTERFACE_MIXINVENTORY)==false
#ifdef LEM_ADD_LUCKYITEM
                && g_pNewUISystem->IsVisible(SEASON3B::INTERFACE_LUCKYITEMWND)==false
#endif // LEM_ADD_LUCKYITEM
                && g_pNewUISystem->IsVisible(SEASON3B::INTERFACE_STORAGE)==false)
        {
                if(m_bRepairEnableLevel == true)
                {
                        m_BtnRepair.Render();
                }
                if(m_bMyShopOpen == true)
                {
                        m_BtnMyShop.Render();
                }
        }
        m_BtnExit.Render();

        DisableAlphaBlend();
}

// ===== Source Main 5.2/source/NewUIMyInventory.cpp : RenderEquippedItem & Render3D =====
void SEASON3B::CNewUIMyInventory::RenderEquippedItem()
{
        for(int i=0; i<MAX_EQUIPMENT_INDEX; i++)
        {
                if(i == EQUIPMENT_HELM)
                {
                        if(gCharacterManager.GetBaseClass(Hero->Class) == CLASS_DARK)
                        {
                                continue;
                        }
                }
#ifdef PBG_ADD_NEWCHAR_MONK
                if((i == EQUIPMENT_GLOVES) && (GetBaseClass(Hero->Class) == CLASS_RAGEFIGHTER))
                        continue;
#endif //PBG_ADD_NEWCHAR_MONK

                EnableAlphaTest();

                RenderImage(m_EquipmentSlots[i].dwBgImage, m_EquipmentSlots[i].x, m_EquipmentSlots[i].y,
                        m_EquipmentSlots[i].width, m_EquipmentSlots[i].height);
                DisableAlphaBlend();

                ITEM* pEquipmentItemSlot = &CharacterMachine->Equipment[i];
                if(pEquipmentItemSlot->Type != -1)
                {
                        ITEM_ATTRIBUTE* pItemAttr = &ItemAttribute[pEquipmentItemSlot->Type];
                        int iLevel = (pEquipmentItemSlot->Level>>3)&15;
                        int iMaxDurability = calcMaxDurability(pEquipmentItemSlot, pItemAttr, iLevel);

                        if( i == EQUIPMENT_RING_LEFT || i == EQUIPMENT_RING_RIGHT)
                        {
                                if( pEquipmentItemSlot->Type == ITEM_HELPER+20 && iLevel == 1
                                        || iLevel == 2 )
                                {
                                        continue;
                                }
                        }

                        if( (pEquipmentItemSlot->bPeriodItem == true) && (pEquipmentItemSlot->bExpiredPeriod == false) )
                                continue;

                        if(pEquipmentItemSlot->Durability <= 0)
                                glColor4f(1.f,0.f,0.f,0.25f);
                        else if(pEquipmentItemSlot->Durability<=(iMaxDurability*0.2f))
                                glColor4f(1.f,0.15f,0.f,0.25f);
                        else if(pEquipmentItemSlot->Durability<=(iMaxDurability*0.3f))
                                glColor4f(1.f,0.5f,0.f,0.25f);
                        else if(pEquipmentItemSlot->Durability<=(iMaxDurability*0.5f))
                                glColor4f(1.f,1.f,0.f,0.25f);
                        else if(IsEquipable(i, pEquipmentItemSlot) == false)
                                glColor4f(1.f,0.f,0.f,0.25f);
                        else
                        {
                                continue;
                        }

                        EnableAlphaTest();
                        RenderColor(m_EquipmentSlots[i].x+1, m_EquipmentSlots[i].y, m_EquipmentSlots[i].width-4, m_EquipmentSlots[i].height-4);
                        EndRenderColor();
                }
        }

        if(CNewUIInventoryCtrl::GetPickedItem() && m_iPointedSlot != -1)
        {
                ITEM* pItemObj = CNewUIInventoryCtrl::GetPickedItem()->GetItem();
                ITEM* pEquipmentItemSlot = &CharacterMachine->Equipment[m_iPointedSlot];
                if( pItemObj && (pEquipmentItemSlot->Type != -1 || false == IsEquipable(m_iPointedSlot, pItemObj))
#ifdef PBG_ADD_NEWCHAR_MONK
                        && !((GetBaseClass(Hero->Class) == CLASS_RAGEFIGHTER) && (m_iPointedSlot == EQUIPMENT_GLOVES))
#endif //PBG_ADD_NEWCHAR_MONK
                        )
                {
                        glColor4f(0.9f, 0.1f, 0.1f, 0.4f);
                        EnableAlphaTest();
                        RenderColor(m_EquipmentSlots[m_iPointedSlot].x+1, m_EquipmentSlots[m_iPointedSlot].y,
                                m_EquipmentSlots[m_iPointedSlot].width-4, m_EquipmentSlots[m_iPointedSlot].height-4);
                        EndRenderColor();
                }
        }

        if(m_iPointedSlot != -1 && m_pNewUI3DRenderMng)
        {
                m_pNewUI3DRenderMng->RenderUI2DEffect(INVENTORY_CAMERA_Z_ORDER, UI2DEffectCallback, this, m_iPointedSlot, 0);
        }
}

void SEASON3B::CNewUIMyInventory::Render3D()
{
        for(int i=0; i<MAX_EQUIPMENT_INDEX; i++)
        {
                ITEM* pEquippedItem = &CharacterMachine->Equipment[i];
                if(pEquippedItem->Type >= 0)
                {
                        float y = 0.f;
                        if(i == EQUIPMENT_ARMOR)
                        {
                                y = m_EquipmentSlots[i].y - 10.f;
                        }
                        else
                        {
                                y = m_EquipmentSlots[i].y;
                        }

                        glColor4f(1.f, 1.f, 1.f, 1.f);
                        RenderItem3D(
                                m_EquipmentSlots[i].x+1,
                                y,
                                m_EquipmentSlots[i].width-4,
                                m_EquipmentSlots[i].height-4,
                                pEquippedItem->Type,
                                pEquippedItem->Level,
                                pEquippedItem->Option1,
                                pEquippedItem->ExtOption,
                                false);
                }
        }
}

// ===== Source Main 5.2/source/NewUIInventoryCtrl.cpp : Render =====
void SEASON3B::CNewUIInventoryCtrl::Render()
{
        int x, y;
        for(y=0; y<m_nRow; y++)
        {
                for(x=0; x<m_nColumn; x++)
                {
                        int iCurSquareIndex = y*m_nColumn+x;

                        if(m_pdwItemCheckBox[iCurSquareIndex] > 1)
                        {
                                EnableAlphaTest();

                                ITEM* pItem = FindItemByKey(m_pdwItemCheckBox[iCurSquareIndex]);

                                if(pItem)
                                {
                                        if(CanChangeItemColorState(pItem) == true)
                                        {
                                                SetItemColorState(pItem);
                                        }

                                        if(pItem->byColorState == ITEM_COLOR_NORMAL)
                                        {
                                                glColor4f(0.3f, 0.5f, 0.5f, 0.6f);
                                        }
                                        else if(pItem->byColorState == ITEM_COLOR_DURABILITY_50)
                                        {
                                                glColor4f(1.0f, 1.0f, 0.f, 0.4f);
                                        }
                                        else if(pItem->byColorState == ITEM_COLOR_DURABILITY_70)
                                        {
                                                glColor4f(1.0f, 0.66f, 0.f, 0.4f);
                                        }
                                        else if(pItem->byColorState == ITEM_COLOR_DURABILITY_80)
                                        {
                                                glColor4f(1.0f, 0.33f, 0.f, 0.4f);
                                        }
                                        else if(pItem->byColorState == ITEM_COLOR_DURABILITY_100)
                                        {
                                                glColor4f(1.0f, 0.f, 0.f, 0.4f);
                                        }
                                        else if(pItem->byColorState == ITEM_COLOR_TRADE_WARNING)
                                        {
                                                glColor4f(1.0f, 0.2f, 0.1f, 0.4f);
                                        }
                                }
                                else
                                {
                                        glColor4f(0.3f, 0.5f, 0.5f, 0.6f);
                                }

                                RenderColor(m_Pos.x+(x*INVENTORY_SQUARE_WIDTH), m_Pos.y+(y*INVENTORY_SQUARE_HEIGHT),INVENTORY_SQUARE_WIDTH, INVENTORY_SQUARE_HEIGHT);
                                EndRenderColor();
                        }

                        EnableAlphaTest();
                        RenderImage(IMAGE_ITEM_SQUARE, m_Pos.x+(x*INVENTORY_SQUARE_WIDTH),m_Pos.y+(y*INVENTORY_SQUARE_HEIGHT), 21, 21);
                }
        }

        EnableAlphaTest();
        RenderImage(IMAGE_ITEM_TABLE_TOP_LEFT, m_Pos.x-WND_LEFT_EDGE, m_Pos.y-WND_TOP_EDGE, 14, 14);
        RenderImage(IMAGE_ITEM_TABLE_TOP_RIGHT, m_Pos.x+m_Size.cx-WND_RIGHT_EDGE, m_Pos.y-WND_TOP_EDGE, 14, 14);
        RenderImage(IMAGE_ITEM_TABLE_BOTTOM_LEFT, m_Pos.x-WND_LEFT_EDGE, m_Pos.y+m_Size.cy-WND_BOTTOM_EDGE, 14, 14);
        RenderImage(IMAGE_ITEM_TABLE_BOTTOM_RIGHT, m_Pos.x+m_Size.cx-WND_RIGHT_EDGE, m_Pos.y+m_Size.cy-WND_BOTTOM_EDGE, 14, 14);

        for(x=m_Pos.x-WND_LEFT_EDGE+14; x<m_Pos.x+m_Size.cx-WND_RIGHT_EDGE; x++)
        {
                RenderImage(IMAGE_ITEM_TABLE_TOP_PIXEL, x, m_Pos.y-WND_TOP_EDGE, 1, 14);
                RenderImage(IMAGE_ITEM_TABLE_BOTTOM_PIXEL, x, m_Pos.y+m_Size.cy-WND_BOTTOM_EDGE, 1, 14);
        }
        for(y=m_Pos.y-WND_TOP_EDGE+14; y<m_Pos.y+m_Size.cy-WND_BOTTOM_EDGE; y++)
        {
                RenderImage(IMAGE_ITEM_TABLE_LEFT_PIXEL, m_Pos.x-WND_LEFT_EDGE, y, 14, 1);
                RenderImage(IMAGE_ITEM_TABLE_RIGHT_PIXEL, m_Pos.x+m_Size.cx-WND_RIGHT_EDGE, y, 14, 1);
        }

        if( ms_pPickedItem )
        {
                bool pickitemvisible = ms_pPickedItem->IsVisible();

                if( pickitemvisible )
                {
                        RECT rcPickedItem, rcInventory, rcIntersect;
                        ms_pPickedItem->GetRect(rcPickedItem);
                        GetRect(rcInventory);

                        if(IntersectRect(&rcIntersect, &rcPickedItem, &rcInventory))
                        {
                                ITEM* pPickItem = ms_pPickedItem->GetItem();
                                ITEM_ATTRIBUTE* pItemAttr = &ItemAttribute[pPickItem->Type];
                                int iPickedItemX = MouseX - ((pItemAttr->Width - 1) * INVENTORY_SQUARE_WIDTH / 2);
                                int iPickedItemY = MouseY - ((pItemAttr->Height - 1) * INVENTORY_SQUARE_HEIGHT / 2);

                                int iColumnX = 0, iRowY = 0;
                                int nItemColumn = pItemAttr->Width, nItemRow = pItemAttr->Height;
                                if(false == GetSquarePosAtPt(iPickedItemX, iPickedItemY, iColumnX, iRowY))
                                {
                                        iColumnX = ((iPickedItemX - rcInventory.left) / INVENTORY_SQUARE_WIDTH);

                                        if(iPickedItemX - rcInventory.left < 0)
                                                iColumnX = ((iPickedItemX - rcInventory.left) / INVENTORY_SQUARE_WIDTH) - 1;
                                        else
                                                iColumnX = (iPickedItemX - rcInventory.left) / INVENTORY_SQUARE_WIDTH;

                                        if(iPickedItemY - rcInventory.top < 0)
                                                iRowY = ((iPickedItemY - rcInventory.top) / INVENTORY_SQUARE_HEIGHT) - 1;
                                        else
                                                iRowY = (iPickedItemY - rcInventory.top) / INVENTORY_SQUARE_HEIGHT;
                                }

                                bool bWarning = false;
                                if(iColumnX < 0 && iColumnX >= -nItemColumn)
                                {
                                        nItemColumn = nItemColumn + iColumnX;
                                        iColumnX = 0;
                                        bWarning = true;
                                }
                                else if(iColumnX+nItemColumn > m_nColumn && iColumnX < m_nColumn)
                                {
                                        nItemColumn = m_nColumn - iColumnX;
                                        bWarning = true;
                                }

                                if(iRowY < 0 && iRowY >= -nItemRow)
                                {
                                        nItemRow = nItemRow + iRowY;
                                        iRowY = 0;
                                        bWarning = true;
                                }
                                else if(iRowY+nItemRow > m_nRow && iRowY < m_nRow)
                                {
                                        nItemRow = m_nRow - iRowY;
                                        bWarning = true;
                                }

                                glColor4f(0.9f, 0.1f, 0.1f, 0.4f);
                                EnableAlphaTest();
                                RenderColor(m_Pos.x+(iColumnX*INVENTORY_SQUARE_WIDTH), m_Pos.y+(iRowY*INVENTORY_SQUARE_HEIGHT),
                                        nItemColumn*INVENTORY_SQUARE_WIDTH, nItemRow*INVENTORY_SQUARE_HEIGHT);
                                EndRenderColor();

                                if(bWarning == false)
                                {
                                        glColor4f(0.9f, 0.1f, 0.1f, 0.4f);
                                        for(int i=0; i<nItemColumn; i++)
                                        {
                                                for(int j=0; j<nItemRow; j++)
                                                {
                                                        int iCurPos = (iRowY+j)*m_nColumn + (iColumnX+i);
                                                        if(m_pdwItemCheckBox[iCurPos] > 1)
                                                        {
                                                                RenderColor(m_Pos.x+((iColumnX+i)*INVENTORY_SQUARE_WIDTH), m_Pos.y+((iRowY+j)*INVENTORY_SQUARE_HEIGHT), INVENTORY_SQUARE_WIDTH, INVENTORY_SQUARE_HEIGHT);
                                                        }
                                                }
                                        }
                                        EndRenderColor();
                                }
                        }
                }
        }
}

// ===== Source Main 5.2/source/NewUIInventoryCtrl.cpp : CNewUIPickedItem::Render3D =====
void SEASON3B::CNewUIPickedItem::Render3D()
{
        if(m_pPickedItem && m_pPickedItem->Type >= 0)
        {
                m_Pos.x = MouseX - m_Size.cx/2;
                m_Pos.y = MouseY - m_Size.cy/2;
                RenderItem3D(m_Pos.x, m_Pos.y, m_Size.cx, m_Size.cy, m_pPickedItem->Type, m_pPickedItem->Level,m_pPickedItem->Option1, m_pPickedItem->ExtOption, true);
        }
}

// ===== Source Main 5.2/source/NewUIInventoryCtrl.cpp : Render3D =====
void SEASON3B::CNewUIInventoryCtrl::Render3D()
{
        type_vec_item::iterator li = m_vecItem.begin();
        for(; li != m_vecItem.end(); li++)
        {
                ITEM* pItem = (*li);
                ITEM_ATTRIBUTE* pItemAttr = &ItemAttribute[pItem->Type];

                float x = m_Pos.x+(pItem->x*INVENTORY_SQUARE_WIDTH);
                float y = m_Pos.y+(pItem->y*INVENTORY_SQUARE_HEIGHT);
                float width = pItemAttr->Width*INVENTORY_SQUARE_WIDTH;
                float height = pItemAttr->Height*INVENTORY_SQUARE_HEIGHT;
                glColor4f(1.f, 1.f, 1.f, 1.f);

                RenderItem3D(x, y, width, height, pItem->Type, pItem->Level, pItem->Option1, pItem->ExtOption, false);
        }
}

// ===== Source Main 5.2/source/ZzzInventory.cpp : RenderItem3D positioning =====
void RenderItem3D(float sx,float sy,float Width,float Height,int Type,int Level,int Option1,int ExtOption,bool PickUp)
{
        bool Success = false;
        if((g_pPickedItem == NULL || PickUp)
                && SEASON3B::CheckMouseIn(sx, sy, Width, Height))
        {
#ifdef PBG_ADD_INGAMESHOPMSGBOX
                if(g_pNewUISystem->IsVisible( SEASON3B::INTERFACE_INGAMESHOP))
                {
                        Success = true;
                }
                else
#endif //PBG_ADD_INGAMESHOPMSGBOX
                {
                        if( g_pNewUISystem->CheckMouseUse() == false )
                                Success = true;
                }
        }

        if(Type>=ITEM_SWORD && Type<ITEM_SWORD+MAX_ITEM_INDEX)
        {
                sx += Width*0.8f;
                sy += Height*0.85f;
        }
        else if(Type>=ITEM_AXE && Type<ITEM_MACE+MAX_ITEM_INDEX)
        {
                if(Type==ITEM_MACE+13)
                {
                        sx += Width*0.6f;
                        sy += Height*0.5f;
                }
                else
                {
                        sx += Width*0.8f;
                        sy += Height*0.7f;
                }
        }
        else if(Type>=ITEM_SPEAR && Type<ITEM_SPEAR+MAX_ITEM_INDEX)
        {
                sx += Width*0.6f;
                sy += Height*0.65f;
        }
        else if( Type==ITEM_BOW+17 )
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if( Type==ITEM_BOW+19 )
        {
                sx += Width*0.7f;
                sy += Height*0.75f;
        }
        else if(Type==ITEM_BOW+20)
        {
                sx += Width*0.5f;
                sy += Height*0.55f;
        }
        else if( Type>=ITEM_BOW+8 && Type<ITEM_BOW+MAX_ITEM_INDEX )
        {
                sx += Width*0.7f;
                sy += Height*0.7f;
        }
        else if(Type>=ITEM_STAFF && Type<ITEM_STAFF+MAX_ITEM_INDEX)
        {
                sx += Width*0.6f;
                sy += Height*0.55f;
        }
        else if(Type>=ITEM_SHIELD && Type<ITEM_SHIELD+MAX_ITEM_INDEX)
        {
                sx += Width*0.5f;
                if(Type == ITEM_SHIELD+15)
                        sy += Height*0.7f;
                else if(Type == ITEM_SHIELD+16)
                        sy += Height*0.9f;
                else if(Type == ITEM_SHIELD+21)
                {
                        sx += Width*0.05f;
                        sy += Height*0.5f;
                }
                else
                        sy += Height*0.6f;
        }
        else if(Type>=ITEM_HELM && Type<ITEM_HELM+MAX_ITEM_INDEX)
        {
                sx += Width*0.5f;
                sy += Height*0.8f;
        }
        else if(Type>=ITEM_ARMOR && Type<ITEM_ARMOR+MAX_ITEM_INDEX)
        {
                sx += Width*0.5f;
                if(Type==ITEM_ARMOR+2 || Type==ITEM_ARMOR+4 || Type==ITEM_ARMOR+6)
                {
                        sy += Height*1.05f;
                }
                else if(Type==ITEM_ARMOR+3 || Type==ITEM_ARMOR+8)
                {
                        sy += Height*1.1f;
                }
                else if ( Type==ITEM_ARMOR+17 || Type==ITEM_ARMOR+18 || Type==ITEM_ARMOR+20 )
                {
                        sy += Height*0.8f;
                }
                else if(Type == ITEM_ARMOR+15)
                {
                        sy += Height * 1.0f;
                }
                else
                {
                        sy += Height*0.8f;
                }
        }
        else if(Type>=ITEM_PANTS && Type<ITEM_BOOTS+MAX_ITEM_INDEX)
        {
                sx += Width*0.5f;
                sy += Height*0.9f;
        }
        else if ( Type==ITEM_HELPER+14 && (Level>>3)==1 )
        {
                sx += Width*0.55f;
                sy += Height*0.85f;
        }
        else if( Type==ITEM_HELPER+14 || Type==ITEM_HELPER+15 )
        {
                sx += Width*0.6f;
                sy += Height*1.f;
        }
        else if(Type==ITEM_HELPER+16 || Type==ITEM_HELPER+17)
        {
                sx += Width*0.5f;
                sy += Height*0.9f;
        }
        else if(Type==ITEM_HELPER+18)
        {
                sx += Width*0.5f;
                sy += Height*0.75f;
        }
        else if(Type==ITEM_HELPER+19)
        {
                switch ( Level>>3 )
                {
                case 0: sx += Width*0.5f; sy += Height*0.5f; break;
                case 1: sx += Width*0.7f; sy += Height*0.8f; break;
                case 2: sx += Width*0.7f; sy += Height*0.7f; break;
                }
        }
        else if( Type == ITEM_HELPER+20 )
        {
                switch( Level>>3 )
                {
                case 0:
                        sx += Width*0.5f; sy+= Height*0.65f; break;
                case 1:
                case 2:
                case 3:
                        sx += Width*0.5f; sy+= Height*0.8f; break;
                }
        }
        else if ( Type==ITEM_HELPER+29 )
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if ( Type==ITEM_HELPER+4 )
        {
                sx += Width*0.5f;
                sy += Height*0.6f;
        }
        else if ( Type==ITEM_HELPER+30 )
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if ( Type==ITEM_HELPER+31 )
        {
                sx += Width*0.5f;
                sy += Height*0.9f;
        }
        else if ( Type==ITEM_POTION+7 )
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if ( Type==ITEM_HELPER+7 )
        {
                sx += Width*0.5f;
                sy += Height*0.9f;
        }
        else if ( Type==ITEM_HELPER+11 )
        {
                switch ( Level>>3 )
                {
                case 0: sx += Width*0.5f; sy += Height*0.8f; break;
                case 1: sx += Width*0.5f; sy += Height*0.5f; break;
                }
        }
        else if(Type == ITEM_HELPER+32)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type == MODEL_HELPER+33)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type == MODEL_HELPER+34)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type == MODEL_HELPER+35)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type == MODEL_HELPER+36)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type == MODEL_HELPER+37)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type>=ITEM_HELPER && Type<ITEM_HELPER+MAX_ITEM_INDEX)
        {
                sx += Width*0.5f;
                sy += Height*0.7f;
        }
        else if(Type==ITEM_POTION+12)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type==ITEM_POTION+11 && ((Level>>3) == 3 || (Level>>3) == 13))
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if ( Type==ITEM_POTION+11 && ( (Level>>3)==14 || (Level>>3)==15 ) )
        {
                sx += Width*0.5f;
                sy += Height*0.8f;
        }
        else if(Type==ITEM_POTION+9 && (Level>>3) == 1)
        {
                sx += Width*0.5f;
                sy += Height*0.8f;
        }
        else if(Type==ITEM_POTION+17 || Type==ITEM_POTION+18 || Type==ITEM_POTION+19)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type==ITEM_POTION+21)
        {
                switch ( Level>>3 )
                {
                case 0: sx += Width*0.5f; sy += Height*0.5f; break;
                case 1: sx += Width*0.4f; sy += Height*0.8f; break;
                case 2: sx += Width*0.4f; sy += Height*0.8f; break;
                case 3: sx += Width*0.5f; sy += Height*0.5f; break;
                }
        }
        else if ( Type>=ITEM_POTION+22 && Type<ITEM_POTION+25 )
        {
                if( Type==ITEM_POTION+24 && (Level>>3)==1 )
                {
                        sx += Width*0.5f;
                        sy += Height*0.8f;
                }
                else
                {
                        sx += Width*0.5f;
                        sy += Height*0.95f;
                }
        }
        else if (Type>=ITEM_POTION+46 && Type<=ITEM_POTION+48 )
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if ( Type>=ITEM_POTION+25 && Type<ITEM_POTION+27 )
        {
                sx += Width*0.5f;
                sy += Height*0.9f;
        }
        else if(Type==ITEM_POTION+31)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type==INDEX_COMPILED_CELE || Type == INDEX_COMPILED_SOUL)
        {
                sx += Width*0.55f;
                sy += Height*0.8f;
        }
        else if ( Type==ITEM_WING+3 )
        {
                sx += Width*0.5f;
                sy += Height*0.45f;
        }
        else if ( Type==ITEM_WING+4 )
        {
                sx += Width*0.5f;
                sy += Height*0.4f;
        }
        else if ( Type==ITEM_WING+5 )
        {
                sx += Width*0.5f;
                sy += Height*0.75f;
        }
        else if ( Type==ITEM_WING+6 )
        {
                sx += Width*0.5f;
                sy += Height*0.55f;
        }
        else if(Type == ITEM_POTION+100)
        {
                sx += Width*0.49f;
                sy += Height*0.28f;
        }
        else if (COMGEM::Check_Jewel_Com(Type) != COMGEM::NOGEM)
        {
                sx += Width*0.55f;
                sy += Height*0.82f;
        }
        else if(Type>=ITEM_POTION && Type<ITEM_POTION+MAX_ITEM_INDEX)
        {
                sx += Width*0.5f;
                sy += Height*0.95f;
        }
        else if((Type >= ITEM_WING+12 && Type <= ITEM_WING+14) || (Type >= ITEM_WING+16 && Type <= ITEM_WING+19))
        {
                sx += Width*0.5f;
                sy += Height*0.75f;
        }
        else if( Type == ITEM_HELPER+66 )
        {
                sx += Width*1.5f;
                sy += Height*1.5f;
        }
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
        else if(Type==ITEM_WING+49)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
        else if(Type==ITEM_WING+50)
        {
                sx += Width*0.5f;
                sy += Height*0.5f;
        }
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
        else
        {
                sx += Width*0.5f;
                sy += Height*0.6f;
        }

#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
        if(Type>=ITEM_SWORD+32 && Type<=ITEM_SWORD+34)
        {
                sx -= Width*0.25f;
                sy -= Height*0.25f;
        }
#endif //PBG_ADD_NEWCHAR_MONK_ITEM

        vec3_t Position;
        CreateScreenVector((int)(sx),(int)(sy),Position, false);
        if ( Type==ITEM_POTION+11 && ( Level>>3) == 1)
        {
                RenderObjectScreen(MODEL_EVENT+4,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+11 && ( Level>>3) == 2)
        {
                RenderObjectScreen(MODEL_EVENT+5,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+11 && ( Level>>3) == 3)
        {
                RenderObjectScreen(MODEL_EVENT+6,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+11 && ( Level>>3) == 5)
        {
                RenderObjectScreen(MODEL_EVENT+8,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+11 && ( Level>>3) == 6)
        {
                RenderObjectScreen(MODEL_EVENT+9,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+11 && 8 <= ( Level>>3) && ( Level>>3) <= 12)
        {
                RenderObjectScreen(MODEL_EVENT+10,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+11 && ( Level>>3) == 13)
        {
                RenderObjectScreen(MODEL_EVENT+6,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+11 && ( (Level>>3)==14 || (Level>>3)==15 ) )
        {
                RenderObjectScreen(MODEL_EVENT+5,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_HELPER+14 && ( Level>>3) == 1)
        {
                RenderObjectScreen ( MODEL_EVENT+16, Level, Option1, ExtOption, Position, Success, PickUp );
        }
        else if ( Type==ITEM_POTION+9 && ( Level>>3) == 1)
        {
                RenderObjectScreen(MODEL_EVENT+7,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type==ITEM_POTION+21 )
        {
                switch ( (Level>>3) )
                {
                case 1:
                        RenderObjectScreen(MODEL_EVENT+11,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                case 2:
                        RenderObjectScreen(MODEL_EVENT+11,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                case 3:
                        RenderObjectScreen(Type+MODEL_ITEM,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                default:
                        RenderObjectScreen(Type+MODEL_ITEM,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                }
        }
        else if ( Type ==ITEM_POTION+45)
        {
                RenderObjectScreen(MODEL_POTION+45,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type >=ITEM_POTION+46 && Type <=ITEM_POTION+48)
        {
                RenderObjectScreen(MODEL_POTION+46,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type ==ITEM_POTION+49)
        {
                RenderObjectScreen(MODEL_POTION+49,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type ==ITEM_POTION+50)
        {
                RenderObjectScreen(MODEL_POTION+50,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type ==ITEM_POTION+32)
        {
                switch ( (Level>>3) )
                {
                case 0:
                        RenderObjectScreen(MODEL_POTION+32,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                case 1:
                        RenderObjectScreen(MODEL_EVENT+21,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                }
        }
        else if ( Type ==ITEM_POTION+33)
        {
                switch ( (Level>>3) )
                {
                case 0:
                        RenderObjectScreen(MODEL_POTION+33,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                case 1:
                        RenderObjectScreen(MODEL_EVENT+22,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                }
        }
        else if ( Type ==ITEM_POTION+34)
        {
                switch ( (Level>>3) )
                {
                case 0:
                        RenderObjectScreen(MODEL_POTION+34,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                case 1:
                        RenderObjectScreen(MODEL_EVENT+23,Level,Option1,ExtOption,Position,Success,PickUp);
                        break;
                }
        }
        else if ( Type >= ITEM_WING+36 && Type <= ITEM_WING+40 )
        {
                RenderObjectScreen(Type+MODEL_ITEM,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_WING+41 )
        {
                RenderObjectScreen(MODEL_STAFF+10,-1,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_WING+42 )
        {
                RenderObjectScreen(MODEL_SWORD+19,-1,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_WING+43 )
        {
                RenderObjectScreen(MODEL_BOW+18,-1,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_WING+44 )
        {
                RenderObjectScreen(MODEL_STAFF+10,-1,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_WING+45 )
        {
                RenderObjectScreen(MODEL_SWORD+19,-1,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_WING+46 )
        {
                RenderObjectScreen(MODEL_BOW+18,-1,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_POTION+93)
        {
                RenderObjectScreen(MODEL_EVENT+15,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if ( Type == ITEM_POTION+94)
        {
                RenderObjectScreen(MODEL_EVENT+14,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if(Type == ITEM_POTION+100)
        {
                RenderObjectScreen(MODEL_POTION+100,Level,Option1,ExtOption,Position,_Angle,PickUp);
        }
        else if(Type == ITEM_ARMOR+60)
        {
                RenderObjectScreen(MODEL_ARMORINVEN_60,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if(Type == ITEM_ARMOR+61)
        {
                RenderObjectScreen(MODEL_ARMORINVEN_61,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else if(Type == ITEM_ARMOR+62)
        {
                RenderObjectScreen(MODEL_ARMORINVEN_62,Level,Option1,ExtOption,Position,Success,PickUp);
        }
        else
        {
                RenderObjectScreen(Type+MODEL_ITEM,Level,Option1,ExtOption,Position,Success,PickUp);
        }
}

// ===== Source Main 5.2/source/ZzzInventory.cpp : RenderObjectScreen rotation handling =====
void RenderObjectScreen(int Type,int ItemLevel,int Option1,int ExtOption,vec3_t Target,int Select,bool PickUp)
{
        int Level = (ItemLevel>>3)&15;
    vec3_t Direction,Position;

        VectorSubtract(Target,MousePosition,Direction);
        if(PickUp)
        VectorMA(MousePosition,0.07f,Direction,Position);
        else
        VectorMA(MousePosition,0.1f,Direction,Position);

        if(Type == MODEL_SWORD+0)
        {
                Position[0] -= 0.02f;
                Position[1] += 0.03f;
                Vector(180.f,270.f,15.f,ObjectSelect.Angle);
        }
        else if(Type==MODEL_BOW+7 || Type==MODEL_BOW+15 )
        {
        Vector(0.f,270.f,15.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_SPEAR+0)
        {
                Position[1] += 0.05f;
                Vector(0.f,90.f,20.f,ObjectSelect.Angle);
        }
        else if( Type==MODEL_BOW+17)
        {
        Vector(0.f,90.f,15.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_HELM+31)
        {
                Position[1] -= 0.06f;
                Position[0] += 0.03f;
        Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_HELM+30)
        {
                Position[1] += 0.07f;
                Position[0] -= 0.03f;
        Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_ARMOR+30)
        {
                Position[1] += 0.1f;
        Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_ARMOR+29)
        {
                Position[1] += 0.07f;
        Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_BOW+21)
        {
                Position[1] += 0.12f;
        Vector(180.f,-90.f,15.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_STAFF+12)
        {
                Position[1] -= 0.1f;
                Position[0] += 0.025f;
        Vector(180.f,0.f,8.f,ObjectSelect.Angle);
        }
        else if (Type >= MODEL_STAFF+21 && Type <= MODEL_STAFF+29)
        {
        Vector(0.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_MACE+14)
        {
                Position[1] += 0.1f;
                Position[0] -= 0.01;
        Vector(180.f,90.f,13.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_ARMOR+34)
        {
                Position[1] += 0.03f;
                Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELM+35)
        {
                Position[0] -= 0.02f;
                Position[1] += 0.05f;
                Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_ARMOR+35)
        {
                Position[1] += 0.05f;
                Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_ARMOR+36)
        {
                Position[1] -= 0.05f;
                Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_ARMOR+37)
        {
                Position[1] -= 0.05f;
                Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if (MODEL_HELM+39 <= Type && MODEL_HELM+44 >= Type)
        {
                Position[1] -= 0.05f;
                Vector(-90.f,25.f,0.f,ObjectSelect.Angle);
        }
        else if(MODEL_ARMOR+38 <= Type && MODEL_ARMOR+44 >= Type)
        {
                Position[1] -= 0.08f;
                Vector(-90.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_SWORD+24)
        {
                Position[0] -= 0.02f;
                Position[1] += 0.03f;
        Vector(180.f,90.f,15.f,ObjectSelect.Angle);
        }
        else if( Type == MODEL_MACE+15)
        {
                Position[1] += 0.05f;
        Vector(180.f,90.f,13.f,ObjectSelect.Angle);
        }
        else if(Type == MODEL_BOW+22 || Type == MODEL_BOW+23)
        {
                Position[0] -= 0.10f;
                Vector(180.f,-90.f,15.f,ObjectSelect.Angle);
        }
        else if(Type >= MODEL_SWORD && Type < MODEL_STAFF+MAX_ITEM_INDEX)
        {
                switch (Type)
                {
                case MODEL_STAFF+14:                                                    Position[1] += 0.04f;   break;
                case MODEL_STAFF+17:    Position[0] += 0.02f;   Position[1] += 0.03f;   break;
                case MODEL_STAFF+18:    Position[0] += 0.02f;                                                   break;
                case MODEL_STAFF+19:    Position[0] -= 0.02f;   Position[1] -= 0.02f;   break;
                case MODEL_STAFF+20:    Position[0] += 0.01f;   Position[1] -= 0.01f;   break;
                }

                if(!ItemAttribute[Type-MODEL_ITEM].TwoHand)
                {
                Vector(180.f,270.f,15.f,ObjectSelect.Angle);
                }
                else
                {
                Vector(180.f,270.f,25.f,ObjectSelect.Angle);
                }
        }
        else if(Type>=MODEL_SHIELD && Type<MODEL_SHIELD+MAX_ITEM_INDEX)
        {
                Vector(270.f,270.f,0.f,ObjectSelect.Angle);
        }
    else if(Type==MODEL_HELPER+3)
    {
                Vector(-90.f,-90.f,0.f,ObjectSelect.Angle);
    }
    else if ( Type==MODEL_HELPER+4 )
    {
                Vector(-90.f,-90.f,0.f,ObjectSelect.Angle);
    }
    else if ( Type==MODEL_HELPER+5 )
    {
                Vector(-90.f,-35.f,0.f,ObjectSelect.Angle);
    }
    else if ( Type==MODEL_HELPER+31 )
    {
                Vector(-90.f,-90.f,0.f,ObjectSelect.Angle);
    }
    else if ( Type==MODEL_HELPER+30 )
    {
        Vector ( -90.f, 0.f, 0.f, ObjectSelect.Angle );
    }
        else if ( Type==MODEL_EVENT+16 )
        {
                Vector ( -90.f, 0.f, 0.f, ObjectSelect.Angle );
        }
    else if ( Type==MODEL_HELPER+16 || Type == MODEL_HELPER+17 )
    {
                Vector(270.f,-10.f,0.f,ObjectSelect.Angle);
    }
        else if ( Type==MODEL_HELPER+18 )
        {
                Vector(290.f,0.f,0.f,ObjectSelect.Angle);
        }
        else if ( Type==MODEL_EVENT+11 )
        {
        Vector(-90.f, -20.f, -20.f, ObjectSelect.Angle);
        }
        else if ( Type==MODEL_EVENT+12)
        {
                Vector(250.f, 140.f, 0.f, ObjectSelect.Angle);
        }
        else if (Type==MODEL_EVENT+14)
        {
                Vector(255.f, 160.f, 0.f, ObjectSelect.Angle);
        }
        else if (Type==MODEL_EVENT+15)
        {
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
    else if ( Type>=MODEL_HELPER+21 && Type<=MODEL_HELPER+24 )
    {
                Vector(270.f, 160.f, 20.f, ObjectSelect.Angle);
    }
        else if ( Type==MODEL_HELPER+29 )
        {
                Vector(290.f,0.f,0.f,ObjectSelect.Angle);
        }

        else if(Type == MODEL_HELPER+32)
        {
                Position[0] += 0.01f;
                Position[1] -= 0.03f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELPER+33)
        {
                Position[1] += 0.02f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELPER+34)
        {
                Position[0] += 0.01f;
                Position[1] += 0.02f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELPER+35)
        {
                Position[0] += 0.01f;
                Position[1] += 0.02f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELPER+36)
        {
                Position[0] += 0.01f;
                Position[1] += 0.05f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELPER+37)
        {
                Position[0] += 0.01f;
                Position[1] += 0.04f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELPER+49)
        {
                Position[1] -= 0.04f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }
        else if(Type == MODEL_HELPER+50)
        {
                Position[1] -= 0.03f;
                Vector(270.f, 0.f, 0.f, ObjectSelect.Angle);
        }

        switch(Type)
        {
        case MODEL_STAFF+7:
                {
                        Vector(0.f,0.f,205.f,ObjectSelect.Angle);
                }break;
        }

        switch(Type)
        {
        case MODEL_WING+8:
        case MODEL_WING+9:
        case MODEL_WING+10:
        case MODEL_WING+11:
                {
                        Position[0] += 0.005f;
                        Position[1] -= 0.02f;
                }
                break;
        case MODEL_POTION+21:
                {
                        Position[0] += 0.005f;
                        Position[1] -= 0.005f;
                }
                break;
        case MODEL_POTION+13:
        case MODEL_POTION+14:
        case MODEL_POTION+22:
                {
                        Position[0] += 0.005f;
                        Position[1] += 0.015f;
                }
                break;
        }

        if(1==Select)
        {
                ObjectSelect.Angle[1] = WorldTime*0.45f;
        }

        ObjectSelect.Type = Type;
        if(ObjectSelect.Type>=MODEL_HELM && ObjectSelect.Type<MODEL_BOOTS+MAX_ITEM_INDEX
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
                || ObjectSelect.Type == MODEL_ARMORINVEN_60
                || ObjectSelect.Type == MODEL_ARMORINVEN_61
                || ObjectSelect.Type == MODEL_ARMORINVEN_62
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
                )
                ObjectSelect.Type = MODEL_PLAYER;
        else if(ObjectSelect.Type==MODEL_POTION+12)
        {
                if(Level==0)
                {
                        ObjectSelect.Type = MODEL_EVENT;
                        Type = MODEL_EVENT;
                }
                else if(Level==2)
                {
                        ObjectSelect.Type = MODEL_EVENT+1;
                        Type = MODEL_EVENT+1;
                }
        }

        BMD *b = &Models[ObjectSelect.Type];
        b->CurrentAction                 = 0;
        ObjectSelect.AnimationFrame      = 0;
        ObjectSelect.PriorAnimationFrame = 0;
        ObjectSelect.PriorAction         = 0;
        if(Type >= MODEL_HELM && Type<MODEL_HELM+MAX_ITEM_INDEX)
        {
                b->BodyHeight = -160.f;
        }
        else if(Type >= MODEL_ARMOR && Type<MODEL_ARMOR+MAX_ITEM_INDEX)
        {
                b->BodyHeight = -150.f;
        }
        else if(Type >= MODEL_PANTS && Type<MODEL_PANTS+MAX_ITEM_INDEX)
        {
                b->BodyHeight = -150.f;
        }
        else if(Type >= MODEL_GLOVES && Type<MODEL_GLOVES+MAX_ITEM_INDEX)
        {
                b->BodyHeight = -150.f;
        }
        else if(Type >= MODEL_BOOTS && Type<MODEL_BOOTS+MAX_ITEM_INDEX)
        {
                b->BodyHeight = -150.f;
        }

        VectorCopy(Position,ObjectSelect.Position);
        ObjectSelect.Angle[0] += WorldTime*0.07f;
        ObjectSelect.Angle[2] += WorldTime*0.05f;

        if(PickUp)
        {
                EnableAlphaTest();
                glColor4f(1.f,1.f,1.f,0.35f);
                RenderBitmap(BITMAP_PICKED_BOX,ObjectSelect.Position[0]-0.028f,ObjectSelect.Position[1]-0.07f,0.056f,0.056f,0.f,0.f,1.f,1.f);
                DisableAlphaBlend();
        }

        b->Animation(BoneTransform,ObjectSelect.AnimationFrame,ObjectSelect.PriorAnimationFrame,ObjectSelect.PriorAction,ObjectSelect.Angle,ObjectSelect.HeadAngle,false,false);
        RenderObject(b,PickUp,Option1,ExtOption,Level);
}
#endif
