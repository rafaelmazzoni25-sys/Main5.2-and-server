// Consolidated reference for item excellent and level effects up to 3D rendering.
// This file reproduces relevant code segments from the existing client source for study purposes.
// Each section is wrapped in #if 0 to avoid affecting compilation.

#if 0
// ===== Source Main 5.2/source/ZzzInfomation.cpp : ItemConvert =====
void ItemConvert(ITEM *ip,BYTE Attribute1,BYTE Attribute2, BYTE Attribute3 )
{
	ip->Level = Attribute1;
	int     Level = (Attribute1>>3)&15;
    int     excel = Attribute2&63;
    int     excelWing = excel;
	int     excelAddValue = 0;
    bool    bExtOption = false;

    if ( ( ip->Type>=ITEM_WING+3 && ip->Type<=ITEM_WING+6 )
		|| ( ip->Type >= ITEM_WING+36 && ip->Type <= ITEM_WING+40 )
		|| (ip->Type >= ITEM_WING+42 && ip->Type <= ITEM_WING+43)
		|| ip->Type==ITEM_SWORD+19
		|| ip->Type==ITEM_BOW+18	
		|| ip->Type==ITEM_STAFF+10
		|| ip->Type==ITEM_MACE+13
		|| ip->Type == ITEM_HELPER+30
		|| ( ITEM_WING+130 <= ip->Type && ip->Type <= ITEM_WING+134 )
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
		|| (ip->Type >= ITEM_WING+49 && ip->Type <= ITEM_WING+50)
		|| (ip->Type == ITEM_WING+135)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
		) 
    {
        excel = 0;
    }
	
    if ( (Attribute3%0x4)==EXT_A_SET_OPTION || (Attribute3%0x4)==EXT_B_SET_OPTION )
    {
        excel = 1;
        bExtOption = true;
    }

	ITEM_ATTRIBUTE *p = &ItemAttribute[ip->Type];
	ip->TwoHand            = p->TwoHand;
	ip->WeaponSpeed        = p->WeaponSpeed;
    ip->DamageMin          = p->DamageMin;
	ip->DamageMax		   = p->DamageMax;
	ip->SuccessfulBlocking = p->SuccessfulBlocking;
	ip->Defense            = p->Defense;
	ip->MagicDefense       = p->MagicDefense;
	ip->WalkSpeed          = p->WalkSpeed;
	ip->MagicPower		   = p->MagicPower;

    int setItemDropLevel = p->Level+30;

	if ( ip->Type==ITEM_MACE+6 )
	{
		excelAddValue = 15;
	}
	else if ( ip->Type==ITEM_BOW+6 )
	{
		excelAddValue = 30;
	}
	else if ( ip->Type==ITEM_STAFF+7 )
	{
		excelAddValue = 25;
	}

	if ( p->DamageMin>0 )
	{
		if ( excel>0 )
		{
			if ( p->Level )
            {
                if ( excelAddValue )
					ip->DamageMin += excelAddValue;
				else
					ip->DamageMin += p->DamageMin*25/p->Level+5;
            }
		}
        if ( bExtOption )
        {
            ip->DamageMin += 5+(setItemDropLevel/40);
        }
        ip->DamageMin     += (min(9,Level)*3);
		switch(Level - 9)
		{
		case 6: ip->DamageMin += 9;break;
		case 5: ip->DamageMin += 8;break;
		case 4: ip->DamageMin += 7;break;
		case 3: ip->DamageMin += 6;break;
		case 2: ip->DamageMin += 5;break;
		case 1: ip->DamageMin += 4;break; 
		default: break;
		};
	}
	if ( p->DamageMax>0 )
	{
		if ( excel>0 )
		{
			if ( p->Level )
            {
                if ( excelAddValue )
					ip->DamageMax += excelAddValue;
				else
					ip->DamageMax += p->DamageMin*25/p->Level+5;
            }
		}
        if ( bExtOption )
        {
            ip->DamageMax += 5+(setItemDropLevel/40);
        }
        ip->DamageMax     += (min(9,Level)*3);
		switch ( Level-9 )
		{
		case 6: ip->DamageMax += 9;break;	// +15
		case 5: ip->DamageMax += 8;break;	// +14
		case 4: ip->DamageMax += 7;break;	// +13
		case 3: ip->DamageMax += 6;break;	// +12
		case 2: ip->DamageMax += 5;break;	// +11
		case 1: ip->DamageMax += 4;break;	// +10
		default: break;
		};
	}
	if ( p->MagicPower>0 )
	{
		if ( excel>0 )
		{
			if ( p->Level )
            {
				if ( excelAddValue )
					ip->MagicPower += excelAddValue;
				else
					ip->MagicPower += p->MagicPower*25/p->Level+5;
            }
		}
        if ( bExtOption )
        {
            ip->MagicPower += 2+(setItemDropLevel/60);
        }
        ip->MagicPower += (min(9,Level)*3);	// ~ +9
		switch ( Level-9 )
		{
		case 6: ip->MagicPower += 9;break;	// +15
		case 5: ip->MagicPower += 8;break;	// +14
		case 4: ip->MagicPower += 7;break;	// +13
		case 3: ip->MagicPower += 6;break;	// +12
		case 2: ip->MagicPower += 5;break;	// +11
		case 1: ip->MagicPower += 4;break;	// +10
		default: break;
		};
		
		ip->MagicPower /= 2;
		
		if(IsCepterItem(ip->Type) == false)
		{
            ip->MagicPower += Level*2;
		}
	}

	if ( p->SuccessfulBlocking>0 )
	{
		if(excel> 0)
		{
			if(p->Level)
				ip->SuccessfulBlocking += p->SuccessfulBlocking*25/p->Level+5;
		}
        ip->SuccessfulBlocking += (min(9,Level)*3);	// ~ +9
		switch(Level - 9)
		{
		case 6: ip->SuccessfulBlocking += 9;break;	// +15
		case 5: ip->SuccessfulBlocking += 8;break;	// +14
		case 4: ip->SuccessfulBlocking += 7;break;	// +13
		case 3: ip->SuccessfulBlocking += 6;break;	// +12
		case 2: ip->SuccessfulBlocking += 5;break;	// +11
		case 1: ip->SuccessfulBlocking += 4;break;	// +10
		default: break;
		};
	}
#ifdef PBG_MOD_NEWCHAR_MONK_WING_2
	if(ip->Type==ITEM_HELPER+30)
	{
		p->Defense = 15;
		ip->Defense = 15;
	}
#endif //PBG_MOD_NEWCHAR_MONK_WING_2
	if ( p->Defense>0 )
	{
		if(ip->Type>=ITEM_SHIELD && ip->Type<ITEM_SHIELD+MAX_ITEM_INDEX)
		{
     		ip->Defense            += Level;
            if ( bExtOption )
            {
                ip->Defense = ip->Defense+(ip->Defense*20/setItemDropLevel+2);
            }
		}
		else
		{
    		if(excel> 0)
			{
				if(p->Level)
      				ip->Defense    += p->Defense*12/p->Level+4+p->Level/5;
			}
            if ( bExtOption )
            {
                ip->Defense = ip->Defense+(ip->Defense*3/setItemDropLevel+2+setItemDropLevel/30);
            }

			if ((ip->Type>=ITEM_WING+3 && ip->Type<=ITEM_WING+6) || ip->Type == ITEM_WING+42)
            {
                ip->Defense     += (min(9,Level)*2);	// ~ +9
            }
            else if ( ip->Type==ITEM_HELPER+30 
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
				|| ip->Type==ITEM_WING+49
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
				)
            {
                ip->Defense     += ( min( 9, Level )*2 );	// ~ +9
            }
			else if ((ip->Type >= ITEM_WING+36 && ip->Type <= ITEM_WING+40) || ip->Type == ITEM_WING+43
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
				|| (ip->Type == ITEM_WING+50)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
				)
			{
                ip->Defense     += (min(9,Level)*4);	// ~ +9
			}
            else
            {
                ip->Defense     += (min(9,Level)*3);	// ~ +9
            }
			if ((ip->Type >= ITEM_WING+36 && ip->Type <= ITEM_WING+40) || ip->Type == ITEM_WING+43
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
				|| ip->Type == ITEM_WING+50
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
				)
			{
				switch(Level - 9)
				{
				case 6: ip->Defense += 10;break;	// +15
				case 5: ip->Defense += 9;break;	// +14
				case 4: ip->Defense += 8;break;	// +13
				case 3: ip->Defense += 7;break;	// +12
				case 2: ip->Defense += 6;break;	// +11
				case 1: ip->Defense += 5;break;	// +10
				default: break;
				};
			}
			else
			{
				switch(Level - 9)
				{
				case 6: ip->Defense += 9;break;	// +15
				case 5: ip->Defense += 8;break;	// +14
				case 4: ip->Defense += 7;break;	// +13
				case 3: ip->Defense += 6;break;	// +12
				case 2: ip->Defense += 5;break;	// +11
				case 1: ip->Defense += 4;break;	// +10
				default: break;
				};
			}
		}
	}
	if ( p->MagicDefense>0 )
    {
        ip->MagicDefense += (min(9,Level)*3);	// ~ +9
		switch(Level - 9)
		{
		case 6: ip->MagicDefense += 9;	// +15
		case 4: ip->MagicDefense += 7;	// +13
		case 3: ip->MagicDefense += 6;	// +12
		case 2: ip->MagicDefense += 5;	// +11
		case 1: ip->MagicDefense += 4;	// +10
		default: break;
		};
    }

	int ItemLevel = p->Level;
    if( excel )	ItemLevel = p->Level + 25;
	else if( bExtOption ) ItemLevel = p->Level + 30;

    int addValue = 4;

	if ((ip->Type>=ITEM_WING+3 && ip->Type<=ITEM_WING+6) || ip->Type == ITEM_WING+42)
    {
        addValue = 5;
    }

	if(p->RequireLevel && ((ip->Type >= ITEM_SWORD && ip->Type < ITEM_WING)
		|| (ip->Type == ITEM_HELPER+37)
		|| (ip->Type >= ITEM_WING+7 && ip->Type <= ITEM_WING+40)
		|| (ip->Type >= ITEM_WING+43 && ip->Type < ITEM_HELPER)
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
		&& (ip->Type != ITEM_WING+49)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
		))
		ip->RequireLevel = p->RequireLevel;
	else if (p->RequireLevel && ((ip->Type >= ITEM_WING && ip->Type <= ITEM_WING+7)
		|| (ip->Type >= ITEM_WING+41 && ip->Type <= ITEM_WING+42)
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
		|| (ip->Type == ITEM_WING+49)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
		|| ip->Type >= ITEM_HELPER))
     	ip->RequireLevel = p->RequireLevel+Level*addValue;
	else
		ip->RequireLevel = 0;


    if(p->RequireStrength)
		ip->RequireStrength  = 20+(p->RequireStrength)*(ItemLevel+Level*3)*3/100;
	else	ip->RequireStrength  = 0;

	if(p->RequireDexterity)
		ip->RequireDexterity = 20+(p->RequireDexterity)*(ItemLevel+Level*3)*3/100;
	else	ip->RequireDexterity = 0;

	if(p->RequireVitality)
		ip->RequireVitality = 20+(p->RequireVitality)*(ItemLevel+Level*3)*3/100;
	else	ip->RequireVitality = 0;

	if(p->RequireEnergy)
	{
		if (ip->Type >= ITEM_STAFF+21 && ip->Type <= ITEM_STAFF+29)
		{
			ip->RequireEnergy = 20+(p->RequireEnergy)*(ItemLevel+Level*1)*3/100;
		}
		else
	
		if((p->RequireLevel > 0) && (ip->Type >= ITEM_ETC && ip->Type < ITEM_ETC+MAX_ITEM_INDEX) )
		{
			ip->RequireEnergy = 20+(p->RequireEnergy)*(p->RequireLevel)*4/100;
		}
		else
 
		{
			ip->RequireEnergy = 20+(p->RequireEnergy)*(ItemLevel+Level*3)*4/100;
		}
	}
	else
	{
		ip->RequireEnergy = 0;
	}

	if(p->RequireCharisma)
		ip->RequireCharisma = 20+(p->RequireCharisma)*(ItemLevel+Level*3)*3/100;
	else	ip->RequireCharisma = 0;

    if(ip->Type==ITEM_WING+11)
    {
		WORD Energy = 0;

        switch(Level)
        {
		case 0:Energy = 30;break;
		case 1:Energy = 60;break;
		case 2:Energy = 90;break;
		case 3:Energy = 130;break;
		case 4:Energy = 170;break;
		case 5:Energy = 210;break;
		case 6:Energy = 300;break;
		case 7:Energy = 500;break;
        }
        ip->RequireEnergy = Energy;
    }

    if ( p->RequireCharisma )
    {
        if ( ip->Type==MODEL_HELPER+5 )
            ip->RequireCharisma = (185+(p->RequireCharisma*15));
        else
            ip->RequireCharisma = p->RequireCharisma;
    }

	if ( ip->Type==ITEM_HELPER+10 )
	{
		if ( Level<=2 )
			ip->RequireLevel = 20;
		else
			ip->RequireLevel = 50;
	}

	if( (ip->Type >= ITEM_HELM+29 && ip->Type <= ITEM_HELM+33) ||
		(ip->Type >= ITEM_ARMOR+29 && ip->Type <= ITEM_ARMOR+33) ||
		(ip->Type >= ITEM_PANTS+29 && ip->Type <= ITEM_PANTS+33) ||
		(ip->Type >= ITEM_GLOVES+29 && ip->Type <= ITEM_GLOVES+33) ||
		(ip->Type >= ITEM_BOOTS+29 && ip->Type <= ITEM_BOOTS+33)  ||
		ip->Type == ITEM_SWORD+22 ||
		ip->Type == ITEM_SWORD+23 ||
		ip->Type == ITEM_STAFF+12 ||
		ip->Type == ITEM_BOW+21 ||
		ip->Type == ITEM_MACE+14
		|| ITEM_STAFF+19 == ip->Type
		|| ITEM_HELM+43 == ip->Type
		|| ITEM_ARMOR+43 == ip->Type
		|| ITEM_PANTS+43 == ip->Type
		|| ITEM_GLOVES+43 == ip->Type
		|| ITEM_BOOTS+43 == ip->Type
#ifdef LEM_ADD_LUCKYITEM
		|| Check_LuckyItem( ip->Type )
#endif // LEM_ADD_LUCKYITEM
		)
	{
		excel = 0;
	}

	if ( excel>0 )
	{
		if(ip->RequireLevel > 0 && ip->Type != ITEM_HELPER+37)
      		ip->RequireLevel += 20;
	}

	ip->SpecialNum = 0;

	if ((ip->Type >= ITEM_WING+3 && ip->Type <= ITEM_WING+6) || ip->Type == ITEM_WING+42)
    {
        if ( excelWing&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 50+Level*5;
			ip->Special[ip->SpecialNum] = AT_IMPROVE_HP_MAX;ip->SpecialNum++;
        }
        if ( (excelWing>>1)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 50+Level*5;
			ip->Special[ip->SpecialNum] = AT_IMPROVE_MP_MAX;ip->SpecialNum++;
        }
        if ( (excelWing>>2)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 3;
			ip->Special[ip->SpecialNum] = AT_ONE_PERCENT_DAMAGE;ip->SpecialNum++;
        }
        if ( (excelWing>>3)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 50;
			ip->Special[ip->SpecialNum] = AT_IMPROVE_AG_MAX;ip->SpecialNum++;
        }
        if ( (excelWing>>4)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 5;
			ip->Special[ip->SpecialNum] = AT_IMPROVE_ATTACK_SPEED;ip->SpecialNum++;
        }
    }
    else if ( ip->Type==ITEM_HELPER+30 
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
			|| ip->Type==ITEM_WING+49
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
			)
    {
#ifndef PBG_MOD_NEWCHAR_MONK_WING_2

		int Cal = 0;
		if(Level <= 9)
			Cal = Level;
		else
			Cal = 9;
		ip->SpecialValue[ip->SpecialNum] = 15+Cal*2;
		switch(Level - 9)
		{
		case 6: ip->SpecialValue[ip->SpecialNum] += 9; break;	// +15
		case 5: ip->SpecialValue[ip->SpecialNum] += 8; break;	// +14
		case 4: ip->SpecialValue[ip->SpecialNum] += 7; break;	// +13
		case 3: ip->SpecialValue[ip->SpecialNum] += 6; break;	// +12
		case 2: ip->SpecialValue[ip->SpecialNum] += 5; break;	// +11
		case 1: ip->SpecialValue[ip->SpecialNum] += 4; break;	// +10
		default: break;
		};
#ifdef PBG_MOD_NEWCHAR_MONK_WING
		if(ip->Type!=ITEM_WING+49)
		{
#endif //PBG_MOD_NEWCHAR_MONK_WING
		ip->Special[ip->SpecialNum] = AT_SET_OPTION_IMPROVE_DEFENCE; ip->SpecialNum++;
#ifdef PBG_MOD_NEWCHAR_MONK_WING
		}
#endif //PBG_MOD_NEWCHAR_MONK_WING

		ip->SpecialValue[ip->SpecialNum] = 20+Level*2;
		ip->Special[ip->SpecialNum] = AT_SET_OPTION_IMPROVE_DAMAGE; ip->SpecialNum++;
#endif //PBG_MOD_NEWCHAR_MONK_WING_2
        if ( excelWing&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 50+Level*5;
			ip->Special[ip->SpecialNum] = AT_IMPROVE_HP_MAX;ip->SpecialNum++;
        }
        
        if ( (excelWing>>1)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 50+Level*5;
			ip->Special[ip->SpecialNum] = AT_IMPROVE_MP_MAX;ip->SpecialNum++;
        }
        
        if ( (excelWing>>2)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 3;
			ip->Special[ip->SpecialNum] = AT_ONE_PERCENT_DAMAGE;ip->SpecialNum++;
        }
        
        if ( (excelWing>>3)&0x01 
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
			&& (ip->Type != ITEM_WING+49)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
			)
        {
		    ip->SpecialValue[ip->SpecialNum] = 10+Level*5;
		    ip->Special[ip->SpecialNum] = AT_SET_OPTION_IMPROVE_CHARISMA; ip->SpecialNum++;
        }
    }
	else if ((ip->Type>=ITEM_WING+36 && ip->Type<=ITEM_WING+40) || ip->Type == ITEM_WING+43
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
			|| (ip->Type == ITEM_WING+50)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
		)
    {
        if ( excelWing&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 5;
			ip->Special[ip->SpecialNum] = AT_ONE_PERCENT_DAMAGE;ip->SpecialNum++;
        }
        if ( (excelWing>>1)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 5;
			ip->Special[ip->SpecialNum] = AT_DAMAGE_REFLECTION;ip->SpecialNum++;
        }
        if ( (excelWing>>2)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 5;
			ip->Special[ip->SpecialNum] = AT_RECOVER_FULL_LIFE;ip->SpecialNum++;
        }
        if ( (excelWing>>3)&0x01 )
        {
			ip->SpecialValue[ip->SpecialNum] = 5;
			ip->Special[ip->SpecialNum] = AT_RECOVER_FULL_MANA;ip->SpecialNum++;
        }
    }
	if((Attribute1>>7)&1)
	{        
#ifdef PBG_ADD_NEWCHAR_MONK_SKILL
		if ( p->m_wSkillIndex!=0 )
#else //PBG_ADD_NEWCHAR_MONK_SKILL
        if ( p->m_bySkillIndex!=0 )
#endif //PBG_ADD_NEWCHAR_MONK_SKILL
        {
#ifdef PBG_ADD_NEWCHAR_MONK_SKILL
			ip->Special[ip->SpecialNum] = p->m_wSkillIndex; ip->SpecialNum++;
#else //PBG_ADD_NEWCHAR_MONK_SKILL
            ip->Special[ip->SpecialNum] = p->m_bySkillIndex; ip->SpecialNum++;
#endif //PBG_ADD_NEWCHAR_MONK_SKILL
        }
    }
	if((Attribute1>>2)&1)
	{
		if(ip->Type>=ITEM_SWORD && ip->Type<ITEM_BOOTS+MAX_ITEM_INDEX)
		{
			if(ip->Type!=ITEM_BOW+7 && ip->Type!=ITEM_BOW+15)
			{
     			ip->Special[ip->SpecialNum] = AT_LUCK;ip->SpecialNum++;
			}
		}
		if ((ip->Type>=ITEM_WING && ip->Type<=ITEM_WING+6) || (ip->Type>=ITEM_WING+41 && ip->Type<=ITEM_WING+42))
		{
   			ip->Special[ip->SpecialNum] = AT_LUCK;ip->SpecialNum++;
		}
        if ( ip->Type==ITEM_HELPER+30 
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
			|| ip->Type==ITEM_WING+49
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
			)
        {
   			ip->Special[ip->SpecialNum] = AT_LUCK;ip->SpecialNum++;
        }
		if (( ip->Type>=ITEM_WING+36 && ip->Type<=ITEM_WING+40) || ip->Type==ITEM_WING+43
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
			|| (ip->Type==ITEM_WING+50)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
			)
        {
   			ip->Special[ip->SpecialNum] = AT_LUCK;ip->SpecialNum++;
        }
	}

	int Option3 = ((Attribute1)&3) + ((Attribute2)&64)/64*4;
	if(Option3)
	{
        if ( ip->Type==ITEM_HELPER+3 )
        {
            if ( Option3&0x01 )
            {
				ip->SpecialValue[ip->SpecialNum] = 5;
				ip->Special[ip->SpecialNum] = AT_DAMAGE_ABSORB;ip->SpecialNum++;
            }
            if ( (Option3>>1)&0x01 )
            {
				ip->SpecialValue[ip->SpecialNum] = 50;
				ip->Special[ip->SpecialNum] = AT_IMPROVE_AG_MAX;ip->SpecialNum++;
            }
            if ( (Option3>>2)&0x01 )
            {
   			    ip->SpecialValue[ip->SpecialNum] = 5;
			    ip->Special[ip->SpecialNum] = AT_IMPROVE_ATTACK_SPEED;ip->SpecialNum++;
            }
        }
        else
        {
	        if(ip->Type>=ITEM_SWORD && ip->Type<ITEM_BOW+MAX_ITEM_INDEX)
		    {
			    if(ip->Type!=ITEM_BOW+7 && ip->Type!=ITEM_BOW+15)
			    {
				    ip->SpecialValue[ip->SpecialNum] = Option3*4;
				    ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
				    ip->RequireStrength += Option3*5;
			    }
		    }
			if(ip->Type>=ITEM_STAFF && ip->Type<ITEM_STAFF+MAX_ITEM_INDEX)
		    {
			    ip->SpecialValue[ip->SpecialNum] = Option3*4;
				if (ip->Type>=ITEM_STAFF+21 && ip->Type<=ITEM_STAFF+29)
					ip->Special[ip->SpecialNum] = AT_IMPROVE_CURSE;
				else
					ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;
				ip->SpecialNum++;
                ip->RequireStrength += Option3*5;
		    }
		    if(ip->Type>=ITEM_SHIELD && ip->Type<ITEM_SHIELD+MAX_ITEM_INDEX)
		    {
			    ip->SpecialValue[ip->SpecialNum] = Option3*5;
			    ip->Special[ip->SpecialNum] = AT_IMPROVE_BLOCKING;ip->SpecialNum++;
			    ip->RequireStrength += Option3*5;
		    }
		    if(ip->Type>=ITEM_HELM && ip->Type<ITEM_BOOTS+MAX_ITEM_INDEX)
		    {
			    ip->SpecialValue[ip->SpecialNum] = Option3*4;
			    ip->Special[ip->SpecialNum] = AT_IMPROVE_DEFENSE;ip->SpecialNum++;
			    ip->RequireStrength += Option3*5;
		    }
		    if(ip->Type>=ITEM_HELPER+8 && ip->Type<ITEM_HELPER+MAX_ITEM_INDEX && ip->Type!=ITEM_HELPER+30 )
		    {
                if ( ip->Type==ITEM_HELPER+24 )
                {
                    ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_MAX_MANA;ip->SpecialNum++;
                }
                else if ( ip->Type==ITEM_HELPER+28 )
                {
                    ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_MAX_AG;ip->SpecialNum++;
                }
                else
                {
                    ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
                }
            }
	        if(ip->Type==ITEM_WING)
		    {
			    ip->SpecialValue[ip->SpecialNum] = Option3;
			    ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
		    }
			else if (ip->Type==ITEM_WING+1 || ip->Type==ITEM_WING+41)
		    {
			    ip->SpecialValue[ip->SpecialNum] = Option3*4;
			    ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;ip->SpecialNum++;
		    }
            else if(ip->Type==ITEM_WING+2)
		    {
			    ip->SpecialValue[ip->SpecialNum] = Option3*4;
			    ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
		    }
            else if ( ip->Type==ITEM_WING+3 )
            {
                if ( (excelWing>>5)&0x01 )
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
                }
                else
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3*4;
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
                }
            }
            else if ( ip->Type==ITEM_WING+4 )
            {
                if ( (excelWing>>5)&0x01 )
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3*4;
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;ip->SpecialNum++;
                }
                else
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
                }
            }
            else if ( ip->Type==ITEM_WING+5 )
            {
                if ( (excelWing>>5)&0x01 )
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3*4;
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
                }
                else
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
                }
            }
            else if ( ip->Type==ITEM_WING+6 )
            {
                if ( (excelWing>>5)&0x01 )
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3*4;
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
                }
                else
                {
			        ip->SpecialValue[ip->SpecialNum] = Option3*4;
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;ip->SpecialNum++;
                }
            }
            else if ( ip->Type==ITEM_HELPER+30 )
			{
				ip->SpecialValue[ip->SpecialNum] = Option3*4;
				ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
			}
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
			else if(ip->Type==ITEM_WING+49)
			{
				if((excelWing>>5)&0x01)
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
				}
				else
				{
					ip->SpecialValue[ip->SpecialNum] = Option3;
					ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
				}
			}
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
			else if (ip->Type == ITEM_WING+42)
			{
				ip->SpecialValue[ip->SpecialNum] = Option3*4;
				if ((excelWing>>5)&0x01)
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;
                else
			        ip->Special[ip->SpecialNum] = AT_IMPROVE_CURSE;
				ip->SpecialNum++;
			}
			else if ( ip->Type==ITEM_WING+36 )
			{
				if ( (excelWing>>4)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
				}
				else if ( (excelWing>>5)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DEFENSE;ip->SpecialNum++;
				}
				else
				{
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
				}
			}
			else if ( ip->Type==ITEM_WING+37 )
			{
				if ( (excelWing>>4)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;ip->SpecialNum++;
				}
				else if ( (excelWing>>5)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DEFENSE;ip->SpecialNum++;
				}
				else
				{
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
				}
			}
			else if ( ip->Type==ITEM_WING+38 )
			{
				if ( (excelWing>>4)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
				}
				else if ( (excelWing>>5)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DEFENSE;ip->SpecialNum++;
				}
				else
				{
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
				}
			}
			else if ( ip->Type==ITEM_WING+39 )
			{
				if ( (excelWing>>4)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
				}
				else if ( (excelWing>>5)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;ip->SpecialNum++;
				}
				else
				{
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
				}
			}
			else if ( ip->Type==ITEM_WING+40 
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
				|| (ip->Type==ITEM_WING+50)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
				)
			{
 				if ( (excelWing>>4)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE;ip->SpecialNum++;
				}
				else if ( (excelWing>>5)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_DEFENSE;ip->SpecialNum++;
				}
				else
				{
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
				}
			}
			else if (ip->Type == ITEM_WING+43)
			{
 				if ( (excelWing>>4)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC;ip->SpecialNum++;
				}
				else if ( (excelWing>>5)&0x01 )
				{
					ip->SpecialValue[ip->SpecialNum] = Option3*4;
					ip->Special[ip->SpecialNum] = AT_IMPROVE_CURSE;ip->SpecialNum++;
				}
				else
				{
			        ip->SpecialValue[ip->SpecialNum] = Option3;
			        ip->Special[ip->SpecialNum] = AT_LIFE_REGENERATION;ip->SpecialNum++;
				}
			}
        }
    }
    if ( ip->Type==ITEM_HELPER+4 )
    {
        giPetManager::SetPetItemConvert( ip, giPetManager::GetPetInfo(ip) );
    }

	if((ip->Type>=ITEM_SHIELD && ip->Type<ITEM_BOOTS+MAX_ITEM_INDEX) || (ip->Type>=ITEM_HELPER+8 && ip->Type<=ITEM_HELPER+9) || (ip->Type>=ITEM_HELPER+21 && ip->Type<=ITEM_HELPER+24))
	{
		if((Attribute2>>5)&1)
		{
			ip->Special[ip->SpecialNum] = AT_IMPROVE_LIFE;ip->SpecialNum++;
		}	
		if((Attribute2>>4)&1)
		{
			ip->Special[ip->SpecialNum] = AT_IMPROVE_MANA;ip->SpecialNum++;
		}	
		if((Attribute2>>3)&1)
		{
			ip->Special[ip->SpecialNum] = AT_DECREASE_DAMAGE;ip->SpecialNum++;
		}	
		if((Attribute2>>2)&1)
		{
			ip->Special[ip->SpecialNum] = AT_REFLECTION_DAMAGE;ip->SpecialNum++;
		}	
		if((Attribute2>>1)&1)
		{
			ip->Special[ip->SpecialNum] = AT_IMPROVE_BLOCKING_PERCENT;ip->SpecialNum++;
		}	
		if((Attribute2)&1)
		{
			ip->Special[ip->SpecialNum] = AT_IMPROVE_GAIN_GOLD;ip->SpecialNum++;
		}	
	}
	if((ip->Type>=ITEM_SWORD && ip->Type<ITEM_STAFF+MAX_ITEM_INDEX) || (ip->Type>=ITEM_HELPER+12 && ip->Type<=ITEM_HELPER+13) || (ip->Type>=ITEM_HELPER+25 && ip->Type<=ITEM_HELPER+28))
	{
		if((Attribute2>>5)&1)
		{
			ip->Special[ip->SpecialNum] = AT_EXCELLENT_DAMAGE;ip->SpecialNum++;
		}	
		if ( (ip->Type>=ITEM_STAFF && ip->Type<ITEM_STAFF+MAX_ITEM_INDEX) ||
			 (ip->Type==ITEM_HELPER+12)
           || ( ip->Type==ITEM_HELPER+25 || ip->Type==ITEM_HELPER+27 )) 
		{
			if((Attribute2>>4)&1)
			{
     			ip->SpecialValue[ip->SpecialNum] = CharacterAttribute->Level/20;
				ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC_LEVEL;ip->SpecialNum++;
			}	
			if((Attribute2>>3)&1)
			{
		   		ip->SpecialValue[ip->SpecialNum] = 2;
				ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC_PERCENT;ip->SpecialNum++;
			}	
		}
		else
		{
			if((Attribute2>>4)&1)
			{
     			ip->SpecialValue[ip->SpecialNum] = CharacterAttribute->Level/20;
				ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE_LEVEL;ip->SpecialNum++;
			}	
			if((Attribute2>>3)&1)
			{
		   		ip->SpecialValue[ip->SpecialNum] = 2;
				ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE_PERCENT;ip->SpecialNum++;
			}	
		}
		if((Attribute2>>2)&1)
		{
   			ip->SpecialValue[ip->SpecialNum] = 7;
			ip->Special[ip->SpecialNum] = AT_IMPROVE_ATTACK_SPEED;ip->SpecialNum++;
		}	
		if((Attribute2>>1)&1)
		{
			ip->Special[ip->SpecialNum] = AT_IMPROVE_GAIN_LIFE;ip->SpecialNum++;
		}	
		if((Attribute2)&1)
		{
			ip->Special[ip->SpecialNum] = AT_IMPROVE_GAIN_MANA;ip->SpecialNum++;
		}	
	}
 	if (ip->Type == ITEM_HELPER+20 )
	{
        switch ( Level )
        {
        case 0:
            ip->SpecialValue[ip->SpecialNum] = 10;
            ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC_PERCENT;ip->SpecialNum++;
            ip->SpecialValue[ip->SpecialNum] = 10;
            ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE_PERCENT;ip->SpecialNum++;
            ip->SpecialValue[ip->SpecialNum] = 10;
            ip->Special[ip->SpecialNum] = AT_IMPROVE_ATTACK_SPEED;ip->SpecialNum++;
            break;
        case 3:
            ip->SpecialValue[ip->SpecialNum] = 10;
            ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC_PERCENT;ip->SpecialNum++;
            ip->SpecialValue[ip->SpecialNum] = 10;
            ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE_PERCENT;ip->SpecialNum++;
            ip->SpecialValue[ip->SpecialNum] = 10;
            ip->Special[ip->SpecialNum] = AT_IMPROVE_ATTACK_SPEED;ip->SpecialNum++;
            break;
        }
	}
	if(ip->Type == ITEM_HELPER+107)
	{
        ip->SpecialValue[ip->SpecialNum] = 15;
        ip->Special[ip->SpecialNum] = AT_IMPROVE_MAGIC_PERCENT;ip->SpecialNum++;
        ip->SpecialValue[ip->SpecialNum] = 15;
        ip->Special[ip->SpecialNum] = AT_IMPROVE_DAMAGE_PERCENT;ip->SpecialNum++;
        ip->SpecialValue[ip->SpecialNum] = 10;
        ip->Special[ip->SpecialNum] = AT_IMPROVE_ATTACK_SPEED;ip->SpecialNum++;
	}

	//part
	if(ip->Type>=ITEM_BOW && ip->Type<ITEM_BOW+8 || ip->Type==ITEM_BOW+17 )
		ip->Part = EQUIPMENT_WEAPON_LEFT;
	if(ip->Type>=ITEM_STAFF+21 && ip->Type<=ITEM_STAFF+29)
		ip->Part = EQUIPMENT_WEAPON_LEFT;
	else if(ip->Type>=ITEM_SWORD && ip->Type<ITEM_STAFF+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_WEAPON_RIGHT;
	else if(ip->Type>=ITEM_SHIELD && ip->Type<ITEM_SHIELD+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_WEAPON_LEFT;
	else if(ip->Type>=ITEM_HELM && ip->Type<ITEM_HELM+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_HELM;
	else if(ip->Type>=ITEM_ARMOR && ip->Type<ITEM_ARMOR+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_ARMOR;
	else if(ip->Type>=ITEM_PANTS && ip->Type<ITEM_PANTS+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_PANTS;
	else if(ip->Type>=ITEM_GLOVES && ip->Type<ITEM_GLOVES+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_GLOVES;
	else if(ip->Type>=ITEM_BOOTS && ip->Type<ITEM_BOOTS+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_BOOTS;
	else if(ip->Type>=ITEM_WING && ip->Type<ITEM_WING+7)
		ip->Part = EQUIPMENT_WING;
	else if(ip->Type>=ITEM_WING+36 && ip->Type<=ITEM_WING+43)
		ip->Part = EQUIPMENT_WING;
	else if(ip->Type==ITEM_HELPER+5)
		ip->Part = EQUIPMENT_WEAPON_LEFT;
	else if(ip->Type>=ITEM_HELPER && ip->Type<ITEM_HELPER+8)
		ip->Part = EQUIPMENT_HELPER;
    else if((ip->Type>=ITEM_HELPER+8 && ip->Type<ITEM_HELPER+12) || (ip->Type == ITEM_HELPER+20 && Level == 0)
		|| (ip->Type == ITEM_HELPER+20 && Level == 3)
		)
		ip->Part = EQUIPMENT_RING_RIGHT;
    else if( ip->Type>=ITEM_HELPER+21 && ip->Type<=ITEM_HELPER+24 )
		ip->Part = EQUIPMENT_RING_RIGHT;
    else if( ip->Type>=ITEM_HELPER+25 && ip->Type<=ITEM_HELPER+28 )
		ip->Part = EQUIPMENT_AMULET;
	else if(ip->Type>=ITEM_HELPER+12 && ip->Type<ITEM_HELPER+MAX_ITEM_INDEX)
		ip->Part = EQUIPMENT_AMULET;
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
	else if(ip->Type>=ITEM_WING+49 && ip->Type<=ITEM_WING+50)
		ip->Part = EQUIPMENT_WING;
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
	else 
		ip->Part = -1;
}

#endif // end ItemConvert extract

#if 0
// ===== Source Main 5.2/source/ZzzObject.cpp : RenderObject item iteration =====
				int Type = o->Type;
				if(o->Type>=MODEL_HELM && o->Type<MODEL_BOOTS+MAX_ITEM_INDEX)
					Type = MODEL_PLAYER;
            	else if(o->Type==MODEL_POTION+12)
				{
                   	int Level = (Items[i].Item.Level>>3)&15;
					if(Level==0)
			    		Type = MODEL_EVENT;
					else if(Level==2)
			    		Type = MODEL_EVENT+1;
				}
				BMD *b = &Models[Type];
				b->CurrentAction = 0;
              	b->Skin          = gCharacterManager.GetBaseClass(Hero->Class);
             	b->CurrentAction = o->CurrentAction;
				VectorCopy(o->Position,b->BodyOrigin);
				ItemHeight(o->Type,b);
               	b->Animation(BoneTransform,o->AnimationFrame,o->PriorAnimationFrame,o->PriorAction,o->Angle,o->HeadAngle,false,false);

				if(o->Type>=MODEL_HELM && o->Type<MODEL_BOOTS+MAX_ITEM_INDEX)
					Type = o->Type;
				b = &Models[Type];
				vec3_t Light;
				RequestTerrainLight(o->Position[0],o->Position[1],Light);
				VectorAdd(Light,o->Light,Light);
				if(o->Type == MODEL_POTION+15)
				{
					vec3_t Temp;
					VectorCopy(o->Position,Temp);
					int Count = (int)sqrtf((float)Items[i].Item.Level)/2;
					if(Count < 3) Count = 3;
					if(Count > 80) Count = 80;
					for(int j=1;j<Count;j++)
					{
						vec3_t Angle;
						float Matrix[3][4];
						vec3_t p,Position;
						Vector(0.f,0.f,(float)(RandomTable[(i*20+j)%100]%360),Angle);
						Vector((float)(RandomTable[(i+j)%100]%(Count+20)),0.f,0.f,p);
						AngleMatrix(Angle,Matrix);
						VectorRotate(p,Matrix,Position);
						VectorAdd(Temp,Position,o->Position);
                        RenderPartObject(o,o->Type,NULL,Light,o->Alpha,Items[i].Item.Level,Items[i].Item.Option1,Items[i].Item.ExtOption,true,true,true);
					}
					VectorCopy(Temp,o->Position);
				}
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
				else if(o->Type == MODEL_WING+50)
				{
					Vector(1.0f,1.0f,1.0f,Light);
				}
#endif //PBG_ADD_NEWCHAR_MONK_ITEM

				vec3_t vBackup;
				VectorCopy( o->Position, vBackup);
				if ( gMapManager.WorldActive == WD_10HEAVEN)
				{
					o->Position[2] += 10.0f * ( float)sinf( ( float)( i * 1237 + WorldTime)*0.002f);
				}
				else if ( gMapManager.WorldActive == WD_39KANTURU_3RD && g_Direction.m_CKanturu.IsMayaScene())
				{
					o->Position[2] += 10.0f * ( float)sinf( ( float)( i * 1237 + WorldTime)*0.002f);
				}
                else if ( gMapManager.InHellas()==true )
                {
					o->Position[2] = GetWaterTerrain ( o->Position[0], o->Position[1] )+180;
                }

                RenderPartObject(o,o->Type,NULL,Light,o->Alpha,Items[i].Item.Level,Items[i].Item.Option1,Items[i].Item.ExtOption,true,true,true);
				VectorCopy( vBackup, o->Position);

				vec3_t Position;
				VectorCopy(o->Position,Position);
				Position[2] += 30.f;
				int ScreenX,ScreenY;
				Projection(Position,&ScreenX,&ScreenY);
				o->ScreenX = ScreenX;
				o->ScreenY = ScreenY;
			}
		}
	}
#endif // end RenderObject item iteration extract

#if 0
// ===== Source Main 5.2/source/ZzzObject.cpp : RenderPartObject =====
    {
        b->RenderBody(Flag,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
    }
	
	BoneScale = 1.f;
}

void RenderPartObjectEdge2(BMD *b, OBJECT* o, int Flag,bool Translate,float Scale, OBB_t* OBB )
{
    vec3_t tmp;

	b->LightEnable = false;
	
	BoneScale = Scale;
	b->Transform(BoneTransform,tmp,tmp,OBB, Translate);
	b->RenderBody(Flag,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
	
	BoneScale = 1.f;
}

void RenderPartObjectEdgeLight(BMD* b, OBJECT* o, int Flag, bool Translate, float Scale )
{
    float Luminosity = sinf( WorldTime*0.001f )*0.5f+0.5f;
    Vector( Luminosity*1.f, Luminosity*0.8f, Luminosity*0.3f, b->BodyLight );
	RenderPartObjectEdge(b,o,Flag,Translate,Scale);
}

void BodyLight(OBJECT *o,BMD *b);

void RenderPartObject(OBJECT *o,int Type,void *p2,vec3_t Light,float Alpha,int ItemLevel,int Option1,int ExtOption,bool GlobalTransform,bool HideSkin,bool Translate,int Select,int RenderType)
{
	if(Alpha <= 0.01f) 
	{
		return;
	}

	PART_t *p = ( PART_t*)p2;
	
	if(Type == MODEL_POTION+12)	
	{
     	int Level = (ItemLevel>>3)&15;

		if(Level == 0)
		{
	     	Type = MODEL_EVENT;
		}
		else if(Level == 2)
		{
	     	Type = MODEL_EVENT+1;
		}
	}

	BMD *b = &Models[Type];
	b->HideSkin       = HideSkin;
	b->BodyScale      = o->Scale;
	b->ContrastEnable = o->ContrastEnable;
	b->LightEnable    = o->LightEnable;
	VectorCopy(o->Position,b->BodyOrigin);

	BoneScale = 1.f;
	if(3==Select)
	{
		BoneScale = 1.4f;
	}
	else if(2==Select)
	{
		BoneScale = 1.2f;
	}
	else if(1==Select)
	{		
        float Scale = 1.2f;
        Scale = o->m_fEdgeScale;
		if(o->Kind == KIND_NPC)
		{
			Vector(0.02f,0.1f,0.f,b->BodyLight);
		}
		else
		{
			Vector(0.1f,0.03f,0.f,b->BodyLight);
		}

        if ( gMapManager.InChaosCastle() )
        {
			Vector(0.1f,0.01f,0.f,b->BodyLight);
			Scale = 1.f + 0.1f/o->Scale;
        }

		RenderPartObjectEdge(b,o,RENDER_BRIGHT,Translate,Scale);
		if(o->Kind == KIND_NPC)
		{
			Vector(0.16f,0.7f,0.f,b->BodyLight);
		}
		else
		{
			Vector(0.7f,0.2f,0.f,b->BodyLight);
		}

        if ( gMapManager.InChaosCastle() )
        {
			Vector(0.7f,0.07f,0.f,b->BodyLight);
			Scale = 1.f + 0.04f/o->Scale + 0.02f;
        }
		RenderPartObjectEdge(b,o,RENDER_BRIGHT,Translate,Scale-0.02f);
	}
	BodyLight(o,b);

	if(GlobalTransform)
	{
     	b->Transform(BoneTransform,o->BoundingBoxMin,o->BoundingBoxMax,&o->OBB,Translate);
	}
	else
    {
     	b->Transform(o->BoneTransform,o->BoundingBoxMin,o->BoundingBoxMax,&o->OBB,Translate);
    }

	if(p)
	{
		int iCloth = 0;
		switch ( Type)
		{
		case MODEL_PANTS+18:
			iCloth = 1;
			break;

        case MODEL_PANTS+19:
			iCloth = 2;
			break;

        case MODEL_PANTS+22:
            iCloth = 3;
            break;
		}

		if ( !p->m_pCloth[0] && iCloth > 0)
		{
			int iCount = 1;
			CPhysicsClothMesh *pCloth[2] = { NULL, NULL};
			switch ( iCloth)
			{
			case 1:
				pCloth[0] = new CPhysicsClothMesh;
				pCloth[0]->Create( o, 2, 17, 0.0f, 9.0f, 7.0f, 5, 8, 45.0f, 85.0f, BITMAP_PANTS_G_SOUL, BITMAP_PANTS_G_SOUL, PCT_MASK_ALPHA | PCT_HEAVY | PCT_STICKED | PCT_SHORT_SHOULDER, Type);
				pCloth[0]->AddCollisionSphere( 0.0f, -15.0f, -20.0f, 30.0f, 2);
				break;
			case 2:
				iCount = 1;
				pCloth[0] = new CPhysicsClothMesh;
				pCloth[0]->Create( o, 3, 2, PCT_OPT_CORRECTEDFORCE | PCT_HEAVY, Type);
				pCloth[0]->AddCollisionSphere( 0.0f, 0.0f, -15.0f, 22.0f, 2);
				pCloth[0]->AddCollisionSphere( 0.0f, 0.0f, -27.0f, 23.0f, 2);
				pCloth[0]->AddCollisionSphere( 0.0f, 0.0f, -40.0f, 24.0f, 2);
				pCloth[0]->AddCollisionSphere( 0.0f, 0.0f, -54.0f, 25.0f, 2);
				pCloth[0]->AddCollisionSphere( 0.0f, 0.0f, -69.0f, 26.0f, 2);
				break;
            case 3:
				pCloth[0] = new CPhysicsClothMesh;
        		pCloth[0]->Create( o, 2, 17, 0.0f, 9.0f, 7.0f, 7, 5, 50.0f, 100.0f, b->IndexTexture[b->Meshs[2].Texture], b->IndexTexture[b->Meshs[2].Texture], PCT_MASK_ALPHA | PCT_HEAVY | PCT_STICKED | PCT_SHORT_SHOULDER, Type);
				pCloth[0]->AddCollisionSphere( 0.0f, -15.0f, -20.0f, 30.0f, 2);
                break;
			}
			p->m_byNumCloth = iCount;
			p->m_pCloth[0] = ( void*)pCloth[0];
			p->m_pCloth[1] = ( void*)pCloth[1];
		}

		if ( p->m_pCloth[0])
		{
			if ( iCloth > 0)
			{
				for ( int i = 0; i < p->m_byNumCloth; ++i)
				{
					CPhysicsCloth *pCloth = ( CPhysicsCloth*)p->m_pCloth[i];
					if ( !pCloth->Move2( 0.005f, 5))
					{
						DeleteCloth( NULL, o, p);
					}
					else
					{
						pCloth->Render();
					}
				}
			}
			else if ( iCloth == 0)
			{
				DeleteCloth( NULL, o, p);
			}
		}
	}

#ifdef PBG_ADD_NEWCHAR_MONK_SKILL
	if(!g_CMonkSystem.RageFighterEffect(o, Type))
#endif //PBG_ADD_NEWCHAR_MONK_SKILL
	RenderPartObjectEffect(o,Type,Light,Alpha,ItemLevel,Option1,ExtOption,Select,RenderType);
}

#endif // end RenderPartObject extract

#if 0
// ===== Source Main 5.2/source/ZzzObject.cpp : RenderPartObjectEffect =====
void RenderPartObjectEffect(OBJECT *o,int Type,vec3_t Light,float Alpha,int ItemLevel,int Option1,int ExtOption,int Select,int RenderType)
{	
	int Level = (ItemLevel>>3)&15;
	if ( RenderType & RENDER_WAVE)
	{
		Level = 0;
	}
	BMD *b = &Models[Type];

    if ( o->EnableShadow==true )
    {
		if(gMapManager.WorldActive == 7)
		{
			EnableAlphaTest();
			glColor4f(0.f,0.f,0.f,0.2f);
		}
		else
		{
			DisableAlphaBlend();
			glColor3f(0.f,0.f,0.f);
		}
        bool bRenderShadow = true;

        if ( gMapManager.InHellas() )
        {
            bRenderShadow = false;
        }

		if ( WD_10HEAVEN == gMapManager.WorldActive || o->m_bySkillCount==3 || g_Direction.m_CKanturu.IsMayaScene() )
        {
            bRenderShadow = false;
        }

		if( g_isCharacterBuff(o, eBuff_Cloaking ) )
        {
            bRenderShadow = false;
        }

		if ( bRenderShadow )
		{
			if ( o->m_bRenderShadow )
		    {
				int iHiddenMesh = o->HiddenMesh;

				if( o->Type == MODEL_MONSTER01+116 )
				{
					iHiddenMesh = 2;
				}
				else if(o->Type == MODEL_MONSTER01+164 )
				{
					iHiddenMesh = 0;
				}
				
				b->RenderBodyShadow(o->BlendMesh,iHiddenMesh);
            }
		}
        return;
    }

	switch(Type)
	{
    case MODEL_HELPER+3:Level = 8;break;
	case MODEL_HELPER+39:Level = 13;break;
	case MODEL_HELPER+40:Level = 13;break;
	case MODEL_HELPER+41:Level = 13;break;
	case MODEL_POTION+51:Level = 13;break;
	case MODEL_HELPER+42:Level = 13;break;
	case MODEL_HELPER+10:Level = 8;break;
    case MODEL_HELPER+30:
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
	case MODEL_WING+49:
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
		Level = 0;break;
    case MODEL_EVENT+16: Level = 0;break;
	case MODEL_POTION+13:
	case MODEL_POTION+14:
	case MODEL_POTION+16:
	case MODEL_POTION+31:
	case MODEL_WING+136:
	case MODEL_WING+138:
	case MODEL_WING+141:
	case MODEL_COMPILED_CELE:
	case MODEL_COMPILED_SOUL:
	case MODEL_WING+15:Level = 8;break;
	case MODEL_WING+36:
	case MODEL_WING+37:
	case MODEL_WING+38:
	case MODEL_WING+39:
	case MODEL_WING+40:
	case MODEL_WING+41:
    case MODEL_WING+42:
    case MODEL_WING+43:
    case MODEL_WING+3:
    case MODEL_WING+4:
    case MODEL_WING+5:
    case MODEL_WING+6:
	case MODEL_WING:
	case MODEL_WING+1:
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
	case MODEL_WING+50:
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
	case MODEL_WING+2:Level = 0;break;
	case MODEL_WING+7:Level = 9;break;
	case MODEL_WING+11:Level = 0;break;
    case MODEL_WING+12:
    case MODEL_WING+13:
    case MODEL_WING+16:
    case MODEL_WING+17:
    case MODEL_WING+18:
    case MODEL_WING+19:
	case MODEL_WING+44:
	case MODEL_WING+45:
	case MODEL_WING+46:
	case MODEL_WING+47:
		{
			Level = 9;
			break;
		}
    case MODEL_WING+14:
		Level = 9;
		break;
	case MODEL_POTION+12:
		Level = 8;
		break;
	case MODEL_POTION+17:
	case MODEL_POTION+18:
	case MODEL_POTION+19:
		{
			if(Level <= 6)
			{
				Level *= 2;
			}
			else
			{
				Level = 13;
			}
		}
		break;
	case MODEL_POTION+20:Level = 9;break;
    case MODEL_POTION+22:Level = 8;break;
	case MODEL_WING+137:Level = 8;break;
    case MODEL_POTION+25:Level = 8;break;
    case MODEL_POTION+26:Level = 8;break;
	case MODEL_WING+139:
	case MODEL_WING+140:
	case MODEL_WING+142:
	case MODEL_WING+143:
	case MODEL_POTION+41:
		Level = 0;break;
	case MODEL_POTION+42:
		Level = 0;break;
	case MODEL_POTION+43:
		Level = 0;break;
	case MODEL_POTION+44:
		Level = 0;break;
	case MODEL_HELPER+50:
	case MODEL_POTION+64:
		Level = 0;break;
	case MODEL_HELPER+52:
	case MODEL_HELPER+53:
		Level = 0;break;
	case MODEL_EVENT+4:Level = 0;break;
	case MODEL_EVENT+6:
		if (Level == 13)
		{
			Level = 13;
		}
		else
		{
			Level = 9;
		}
		break;
	case MODEL_EVENT+7:Level = 0;break;
	case MODEL_EVENT+8:Level = 0;break;
	case MODEL_EVENT+9:Level = 8;break;
    case MODEL_EVENT+5:
        {
            Level = 0;
        }
        break;
	case MODEL_EVENT+10:
		Level = (Level - 8) * 2 + 1;
		break;
    case MODEL_EVENT+11:
        Level--;
        break;
	case MODEL_EVENT+12:
		Level = 0;
		break;
	case MODEL_EVENT+13:
		Level = 0;
		break;
	case MODEL_EVENT+14:
		Level += 7;
		break;
	case MODEL_EVENT+15:
		Level = 8;
		break;
	case MODEL_EVENT:
	case MODEL_EVENT+1:Level = 8;break;
    case MODEL_BOW+7: Level>=1?Level=Level*2+1:Level=0;break;
    case MODEL_BOW+15:Level>=1?Level=Level*2+1:Level=0;break;
#ifdef LJH_ADD_ITEMS_EQUIPPED_FROM_INVENTORY_SYSTEM
	case MODEL_HELPER+134:
		Level = 13;
		break;
#endif //LJH_ADD_ITEMS_EQUIPPED_FROM_INVENTORY_SYSTEM
	}

	if(g_pOption->GetRenderLevel() < 4)
	{
		Level = min( Level, g_pOption->GetRenderLevel() * 2 + 5 );
	}

	if(o->Type==MODEL_SPEAR+9)
	{
		Vector(0.5f,0.5f,1.5f,b->BodyLight);
		b->StreamMesh = 0;
		b->RenderBody(RENDER_TEXTURE,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh,BITMAP_CHROME);
		b->StreamMesh = -1;
	}
    else if ( o->Type==MODEL_POTION+27 )
    {
        Vector(1.f,1.f,1.f,b->BodyLight);
		b->StreamMesh = 0;
        b->RenderMesh(0, RENDER_TEXTURE,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV );
        if ( Level==1 )
        {
        }
        else if ( Level==2 )
        {
		    b->RenderMesh(1, RENDER_TEXTURE,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV );
            Vector(0.75f,0.65f,0.5f,b->BodyLight);
		    b->RenderMesh(1, RENDER_BRIGHT|RENDER_CHROME,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,BITMAP_CHROME );
        }
        else if ( Level==3 )
        {
		    b->RenderMesh(1, RENDER_TEXTURE,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV );
    		b->RenderMesh(2, RENDER_TEXTURE,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV );
            Vector(0.75f,0.65f,0.5f,b->BodyLight);
		    b->RenderMesh(1, RENDER_BRIGHT|RENDER_CHROME,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,BITMAP_CHROME );
		    b->RenderMesh(2, RENDER_BRIGHT|RENDER_CHROME,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,BITMAP_CHROME );
        }
		b->StreamMesh = -1;
        return;
    }
	else if ( o->Type==MODEL_POTION+63 )
	{
		b->StreamMesh = 0;
        o->BlendMeshLight = 1.f;
		Vector(1.f,1.f,1.f,b->BodyLight);
		b->RenderMesh(0, RENDER_TEXTURE,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
		Vector(1.f,0.f,0.f,b->BodyLight);
		b->LightEnable = true;
		b->RenderMesh(1, RENDER_TEXTURE,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
        b->RenderMesh(1, RENDER_BRIGHT|RENDER_CHROME,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
		b->StreamMesh = -1;
        return;
	}
	else if (o->Type == MODEL_POTION+52 )
	{
		Vector(1.f,1.f,1.f,b->BodyLight);
		b->RenderBody(RENDER_TEXTURE,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV );
		b->LightEnable = true;
		Vector(0.1f,0.6f,0.4f,b->BodyLight);
		o->Alpha = 0.5f;
        b->RenderMesh(0, RENDER_BRIGHT|RENDER_CHROME,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
        return;
	}
    else if ( o->Type==MODEL_EVENT+14 && Level==9 )
    {
        Vector(0.3f,0.8f,1.f,b->BodyLight);
        b->RenderBody(RENDER_TEXTURE,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV );
        Vector(1.f,0.8f,0.3f,b->BodyLight);
        b->RenderBody(RENDER_BRIGHT|RENDER_CHROME,o->Alpha,-1,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV );
        return;
    }
    else if ( (o->Type>=MODEL_WING+21 && o->Type<=MODEL_WING+24) 
		|| o->Type==MODEL_WING+35 
		|| (o->Type==MODEL_WING+48)
		)
    {
		
    	b->BeginRender(o->Alpha);
     	glColor3f ( 1.f, 1.f, 1.f );
        o->BlendMeshLight = 1.f;
        b->RenderMesh ( 0, RENDER_TEXTURE, Alpha, -1, o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
        o->BlendMeshLight = sinf ( WorldTime*0.001f )*0.5f+0.5f;
        b->RenderMesh ( 1, RENDER_BRIGHT|RENDER_TEXTURE, Alpha, 1, o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
        b->RenderMesh ( 2, RENDER_BRIGHT|RENDER_TEXTURE, Alpha, 2, 1-o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
        b->EndRender();		
        return;
    }
    else if ( o->Type==MODEL_HELPER+31 )
    {
		b->RenderBody(RENDER_TEXTURE,Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
        switch ( Level )
        {
        case 0:
            b->RenderMesh ( 0, RENDER_BRIGHT|RENDER_TEXTURE,Alpha, 0,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
            break;

        case 1:
            Vector ( 0.3f, 0.8f, 1.f, b->BodyLight );
            b->RenderMesh ( 0, RENDER_BRIGHT|RENDER_TEXTURE,Alpha, 0, o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
            break;
        }
        return;
    }
	else if(o->Type >= MODEL_POTION && o->Type <= MODEL_POTION+6)
	{
		if(Level > 0)
			Level = 7;
	}
	else if ((o->Type >= MODEL_WING+60 && o->Type <= MODEL_WING+65)
		|| (o->Type >= MODEL_WING+70 && o->Type <= MODEL_WING+74)
		|| (o->Type >= MODEL_WING+100 && o->Type <= MODEL_WING+129))
	{
		Level = 0;
	}
    else if( o->Type==MODEL_HELPER+15 )
    {
        switch ( Level )
        {
        case 0 : Vector(0.0f,0.5f,1.0f,b->BodyLight); break;
        case 1 : Vector(1.0f,0.2f,0.0f,b->BodyLight); break;
        case 2 : Vector(1.0f,0.8f,0.0f,b->BodyLight); break;
        case 3 : Vector(0.6f,0.8f,0.4f,b->BodyLight); break;
        }
		b->RenderBody(RENDER_METAL,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh,BITMAP_CHROME+1);
		b->RenderBody(RENDER_BRIGHT|RENDER_CHROME,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh,BITMAP_CHROME+1);
        return;
    }
	else if(o->Type == MODEL_EVENT+11)
	{
		Vector(0.9f,0.9f,0.9f,b->BodyLight);
		b->RenderBody(RENDER_TEXTURE,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
		b->RenderBody(RENDER_CHROME|RENDER_BRIGHT,0.5f,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,-1,BITMAP_CHROME+1);
		return;
	}
    else if ( Type==MODEL_EVENT+5 && ((ItemLevel>>3)&15)==14 )
    {
		Vector(0.2f,0.3f,0.5f,b->BodyLight);
		b->RenderBody ( RENDER_TEXTURE, o->Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV, o->HiddenMesh );
        Vector(0.1f,0.3f,1.f,b->BodyLight);
		b->RenderBody(RENDER_CHROME|RENDER_BRIGHT,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
		b->RenderBody(RENDER_METAL|RENDER_BRIGHT,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
        return;
    }
    else if ( Type==MODEL_EVENT+5 && ((ItemLevel>>3)&15)==15 )
    {
		Vector(0.5f,0.3f,0.2f,b->BodyLight);
		b->RenderBody ( RENDER_TEXTURE, o->Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV, o->HiddenMesh );
        Vector(1.f,0.3f,0.1f,b->BodyLight);
		b->RenderBody(RENDER_CHROME|RENDER_BRIGHT,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
		b->RenderBody(RENDER_METAL|RENDER_BRIGHT,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
        return;
    }
	else if(o->Type == MODEL_HELPER+17)
	{
		Vector(.9f,.1f,.1f,b->BodyLight);
		o->BlendMeshTexCoordU = sinf( gMapManager.WorldActive*0.0001f );
		o->BlendMeshTexCoordV = -WorldTime*0.0005f;
		Models[o->Type].StreamMesh = 0;
		b->RenderBody(RENDER_TEXTURE,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh,BITMAP_CHROME);
		Models[o->Type].StreamMesh = -1;
		Vector(.9f,.9f,.9f,b->BodyLight);
		b->RenderBody(RENDER_TEXTURE,o->Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
		return;
	}
	else if(o->Type == MODEL_HELPER+18)
	{
		Vector(0.8f, 0.8f, 0.8f,b->BodyLight);
		float sine = float(sinf(WorldTime*0.002f)*0.3f)+0.7f;

		b->RenderBody(RENDER_TEXTURE|RENDER_BRIGHT,1.0f,0,sine,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
		return;
	}
	else if( o->Type==MODEL_EVENT+12)
	{
        float Luminosity = (float)sinf((WorldTime)*0.002f)*0.35f+0.65f;
        vec3_t p,Position,EffLight;
		Vector ( 0.f, 0.f, 15.f, p );

		float Scale = Luminosity*0.8f+2.f;
		Vector(Luminosity*0.32f,Luminosity*0.32f,Luminosity*2.f,EffLight);

        b->TransformPosition(BoneTransform[0],p,Position);
		VectorAdd(Position, o->Position, Position);

		CreateSprite(BITMAP_SPARK+1,Position,Scale,EffLight,o);
	}
	else if(o->Type == MODEL_EVENT+6 && Level == 13)
	{
		Vector(0.4f, 0.6f, 1.0f,b->BodyLight);
		b->RenderBody(RENDER_COLOR,1.0f,0,1.0f,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
		b->RenderBody(RENDER_CHROME|RENDER_BRIGHT,1.0f,0,1.0f,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV,o->HiddenMesh);
		return;
	}
	else if( o->Type==MODEL_EVENT+13 )
	{
		float Luminosity = (float)sinf((WorldTime)*0.002f)*0.35f+0.65f;
        vec3_t p,Position,EffLight;
		Vector ( 0.f, -5.f, -15.f, p );

		float Scale = Luminosity*0.8f+2.5f;
		Vector(Luminosity*2.f,Luminosity*0.32f,Luminosity*0.32f,EffLight);

		b->StreamMesh = 0;
		o->BlendMeshTexCoordV = (int)-WorldTime%4000 * 0.00025f;

        b->TransformPosition(BoneTransform[0],p,Position);
		VectorAdd(Position, o->Position, Position);

		CreateSprite(BITMAP_SPARK+1,Position,Scale,EffLight,o);
	}
	else if( o->Type==MODEL_POTION+17 )
	{
        float   sine = (float)sinf(WorldTime*0.002f)*10.f+15.65f;

        o->BlendMesh = 1;
		o->BlendMeshLight = sine;
		o->BlendMeshTexCoordV = (int)WorldTime%2000 * 0.0005f;
        o->Alpha = 2.0f;
		
        float Luminosity = sine;
		Vector ( Luminosity/5.0f, Luminosity/5.0f, Luminosity/5.0f, o->Light );
	}
	else if(o->Type==MODEL_POTION+18)
	{
        float Luminosity = (float)sinf((WorldTime)*0.002f)*0.35f+0.65f;
        vec3_t p,Position,EffLight;
		Vector ( 0.f, 0.f, 0.f, p );

		float Scale = Luminosity*0.8f;
		Vector(Luminosity*2,Luminosity*0.32f,Luminosity*0.32f,EffLight);
		
        b->TransformPosition(BoneTransform[1],p,Position);
		VectorAdd(Position, o->Position, Position);
		CreateSprite(BITMAP_SPARK+1,Position,Scale,EffLight,o);

		b->TransformPosition(BoneTransform[2],p,Position);
		VectorAdd(Position, o->Position, Position);
		CreateSprite(BITMAP_SPARK+1,Position,Scale,EffLight,o);
	}
	else if(o->Type==MODEL_POTION+19)
	{
        float Luminosity = (float)sinf((WorldTime)*0.002f)*0.35f+0.65f;
		vec3_t p,Position,EffLight;
		Vector ( 0.f, 0.f, 0.f, p );

        float Scale = Luminosity*0.8f;
		Vector(Luminosity*2,Luminosity*0.32f,Luminosity*0.32f,EffLight);
		
        b->TransformPosition(BoneTransform[9],p,Position);
		VectorAdd(Position, o->Position, Position);
		CreateSprite(BITMAP_SPARK+1,Position,Scale,EffLight,o);

		b->TransformPosition(BoneTransform[10],p,Position);
		VectorAdd(Position, o->Position, Position);
		CreateSprite(BITMAP_SPARK+1,Position,Scale,EffLight,o);
	}
    else if(o->Type==MODEL_POTION+21)
    {
        float Luminosity = (float)sinf((WorldTime)*0.002f)*0.25f+0.75f;
		vec3_t EffLight;
		
        Vector(Luminosity*1.f,Luminosity*0.5f,Luminosity*0.f,EffLight);
		CreateSprite(BITMAP_SPARK+1,o->Position,2.5f,EffLight,o);
    }
    else if( o->Type==MODEL_WING+5 )
    {
        o->BlendMeshLight = (float)(sinf(WorldTime*0.001f)+1.f)/4.f;
    }
    else if( o->Type==MODEL_WING+4 )
    {
        o->BlendMeshLight = (float)sinf(WorldTime*0.001f)+1.1f;
    }
    else if ( Type==MODEL_PANTS+24 || Type==MODEL_HELM+24 )
    {
        o->BlendMeshLight = sinf( WorldTime*0.001f )*0.4f+0.6f;
    }
	else if ( o->Type==MODEL_STAFF+11 )
    {
        o->BlendMeshLight = sinf(WorldTime*0.004f)*0.3f+0.7f;
    }
	else if ( Type==MODEL_HELM+19 || Type==MODEL_GLOVES+19 || Type==MODEL_BOOTS+19 )
	{
		o->BlendMeshLight = 1.f;
	}
    else if ( Type==MODEL_POTION+7 )
    {
        switch ( Level )
        {
        case 0: o->HiddenMesh = 1; break;
        case 1: o->HiddenMesh = 0; break;
        }
    }
    else if ( Type==MODEL_HELPER+7 )
    {
        switch ( Level )
        {
        case 0: o->HiddenMesh = 1; break;
        case 1: o->HiddenMesh = 0; break;
        }
    }
    else if ( Type==MODEL_HELPER+11 )
    {
        o->HiddenMesh = 1;
    }
    else if ( Type==MODEL_EVENT+18 )
    {
        o->BlendMesh = 1;
    }
    else if( o->Type==MODEL_WING+6 )
    {
        vec3_t  posCenter, p, Position, Light;
        float   Scale = sinf(WorldTime*0.004f)*0.3f+0.3f;

        Scale = ( Scale*10.f ) + 20.f;

        Vector ( 0.6f, 0.3f, 0.8f, Light );

        Vector ( 0.f, 0.f, 0.f, p );

        for ( int i=0; i<5; ++i )
        {
            b->TransformPosition(BoneTransform[22-i],p,posCenter,true);
            b->TransformPosition(BoneTransform[30-i],p,Position,true);
            CreateJoint ( BITMAP_JOINT_THUNDER, Position, posCenter, o->Angle, 14, o, Scale );
            CreateJoint ( BITMAP_JOINT_SPIRIT, posCenter, Position, o->Angle, 4, o, Scale+5 );
		    CreateSprite( BITMAP_FLARE_BLUE,posCenter,Scale/28.f,Light,o );
        }

        for ( int i=0; i<5; ++i )
        {
            b->TransformPosition(BoneTransform[7-i],p,posCenter,true);
            b->TransformPosition(BoneTransform[11+i],p,Position,true);
            CreateJoint ( BITMAP_JOINT_THUNDER, Position, posCenter, o->Angle, 14, o, Scale );
            CreateJoint ( BITMAP_JOINT_SPIRIT, posCenter, Position, o->Angle, 4, o, Scale+5 );
		    CreateSprite(BITMAP_FLARE_BLUE,posCenter,Scale/28.f,Light,o);
        }
    }
	else if(Type == MODEL_WING+36)
	{
		vec3_t vRelativePos, vPos, vLight;
		Vector(0.f, 0.f, 0.f, vRelativePos);
		Vector(0.f, 0.f, 0.f, vPos);
		Vector(0.f, 0.f, 0.f, vLight);

		float fLuminosity = absf(sinf(WorldTime*0.0004f))*0.4f;
		Vector(0.5f + fLuminosity, 0.5f + fLuminosity, 0.5f + fLuminosity, vLight);
		int iBone[] = { 9, 20, 19, 10, 18,
						28, 27, 36, 35, 38, 
						37, 53, 48, 62, 70, 
						72, 71, 78, 79, 80, 
						87, 90, 91, 106, 102};
		float fScale = 0.f;

		for(int i=0; i<25; ++i)
		{
			b->TransformPosition(BoneTransform[iBone[i]], vRelativePos, vPos, true);
			fScale = 0.5f;// (rand()%10) * 0.05f + 0.3f;
			CreateSprite(BITMAP_CLUD64, vPos, fScale, vLight, o, WorldTime*0.01f, 1);
		}

		int iBoneThunder[] = { 11, 21, 29, 63, 81, 89 };
		if(rand()%2 == 0)
		{
			for(int i=0; i<6; ++i)
			{
				b->TransformPosition(BoneTransform[iBoneThunder[i]], vRelativePos, vPos, true);
				if(rand()%20 == 0)
				{
					Vector(0.6f, 0.6f, 0.9f, vLight);
					CreateEffect(MODEL_FENRIR_THUNDER, vPos, o->Angle, vLight, 1, o);
				}
			}
		}

		int iBoneLight[] = {64, 61, 69, 77, 86, 
							98, 97, 99, 104, 103, 
							105, 12, 8, 17, 26, 
							34, 52, 44, 51, 50, 
							49, 45 };

		fScale = absf(sinf(WorldTime*0.003f))*0.2f;

		for(int i=0; i<22; ++i)
		{
			b->TransformPosition(BoneTransform[iBoneLight[i]],vRelativePos,vPos,true);
			if(iBoneLight[i] == 12 || iBoneLight[i] == 64 || iBoneLight[i] == 98 || iBoneLight[i] == 52)
			{
				Vector(0.9f, 0.0f, 0.0f, vLight);
				CreateSprite(BITMAP_LIGHT, vPos, fScale+1.4f, vLight, o);
			}
			else
			{
				Vector(0.8f, 0.5f, 0.2f, vLight);
				CreateSprite(BITMAP_LIGHT, vPos, fScale+0.3f, vLight, o);
			}
		}
	}
	else if(Type == MODEL_WING+37)
	{
		vec3_t  p, Position, Light;
		Vector ( 0.f, 0.f, 0.f, p );
		float Scale = absf(sinf(WorldTime*0.003f))*0.2f;
		float Luminosity = absf(sinf(WorldTime*0.003f))*0.3f;

		Vector ( 0.5f + Luminosity, 0.5f + Luminosity, 0.6f + Luminosity, Light );
		//int iRedFlarePos[] = { 25, 32, 53, 15, 9, 35 };
		int iRedFlarePos[] = { 24, 31, 15, 8, 53, 35 };
		for (int i = 0; i < 6; ++i)
		{
			b->TransformPosition(BoneTransform[iRedFlarePos[i]],p,Position,true);
			CreateSprite(BITMAP_LIGHT,Position,Scale+1.3f,Light,o);
		}

		Vector ( 0.1f, 0.1f, 0.9f, Light );
		//int iGreenFlarePos[] = { 23, 22, 24, 34, 5, 31, 14, 12, 27, 8, 6, 7, 16, 13, 56, 37, 58, 40, 39, 38 };
		int iGreenFlarePos[] = { 22, 23, 25, 29, 30, 28, 32, 13, 16, 14, 12, 9, 7, 6, 57, 58, 40, 39 };

		for (int i = 0; i < 18; ++i)
		{
			b->TransformPosition(BoneTransform[iGreenFlarePos[i]],p,Position,true);
			CreateSprite(BITMAP_LIGHT,Position,Scale+1.5f,Light,o);
		}
		int iGreenFlarePos2[] = { 56, 38, 51, 45 };

		for (int i = 0; i < 4; ++i)
		{
			b->TransformPosition(BoneTransform[iGreenFlarePos2[i]],p,Position,true);
			CreateSprite(BITMAP_LIGHT,Position,Scale+0.5f,Light,o);
		}
	}
	else if(Type == MODEL_WING+38)
	{
		vec3_t  p, Position, Light;
		Vector ( 0.f, 0.f, 0.f, p );
		float Scale = absf(sinf(WorldTime*0.002f))*0.2f;
		float Luminosity = absf(sinf(WorldTime*0.002f))*0.4f;

		Vector ( 0.5f + Luminosity, 0.0f + Luminosity, 0.0f + Luminosity, Light );
		int iRedFlarePos[] = { 5, 6, 7, 8, 18, 19, 23, 24, 25, 27, 37, 38 };
		for (int i = 0; i < 12; ++i)
		{
			b->TransformPosition(BoneTransform[iRedFlarePos[i]],p,Position,true);
			CreateSprite(BITMAP_FLARE,Position,Scale+0.6f,Light,o);
		}

		Vector ( 0.0f + Luminosity, 0.5f + Luminosity, 0.0f + Luminosity, Light );
		int iGreenFlarePos[] = { 4, 9, 13, 14, 26, 32, 31, 33 };

		for (int i = 0; i < 8; ++i)
		{
			b->TransformPosition(BoneTransform[iGreenFlarePos[i]],p,Position,true);
			CreateSprite(BITMAP_LIGHT,Position,1.3f,Light,o);
		}

		Vector ( 1.0f, 1.0f, 1.0f, Light );
		float fLumi = (sinf(WorldTime*0.004f) + 1.0f) * 0.05f;
		Vector(0.8f+fLumi, 0.8f+fLumi, 0.3f+fLumi, Light);
		CreateSprite(BITMAP_LIGHT, Position, 0.4f, Light, o, 0.5f);
		if(rand()%15 >= 8)
		{
			b->TransformPosition(BoneTransform[13],p,Position,true);
			CreateParticle(BITMAP_SHINY, Position, o->Angle, Light, 5, 0.5f);
			b->TransformPosition(BoneTransform[31],p,Position,true);
			CreateParticle(BITMAP_SHINY, Position, o->Angle, Light, 5, 0.5f);
		}
	}
	else if(Type == MODEL_WING+39)
	{
		vec3_t  p, Position, Light;
		Vector ( 0.f, 0.f, 0.f, p );
		float Scale = absf(sinf(WorldTime*0.003f))*0.2f;
		float Luminosity = absf(sinf(WorldTime*0.003f))*0.3f;

		Vector ( 0.7f + Luminosity, 0.5f + Luminosity, 0.8f + Luminosity, Light );
		int iRedFlarePos[] = { 6, 15, 24, 56, 47, 38 };
		for (int i = 0; i < 6; ++i)
		{
			b->TransformPosition(BoneTransform[iRedFlarePos[i]],p,Position,true);
			CreateSprite(BITMAP_LIGHT,Position,Scale+1.5f,Light,o);
		}

		Vector ( 0.6f, 0.4f, 0.7f, Light );
		int iSparkPos[] = { 7, 16, 25, 57, 48, 39,
							11, 22, 31, 63, 54, 40, 
							10, 21, 30, 62, 53, 41,
							9, 20, 29, 61, 52, 42,
							8, 19, 28, 60, 51, 43,
							18, 27, 59, 50,
							17, 26, 58, 49 };
		int iNumParticle = 1;

		for (int i = 0; i < 6; ++i)
		{
			b->TransformPosition(BoneTransform[iSparkPos[i]],p,Position,true);
			for (int j = 0; j < iNumParticle; ++j)
				CreateParticle(BITMAP_CHROME_ENERGY2,Position,o->Angle,Light, 0, 0.1f);
		}

		for (int i = 6; i < 18; ++i)
		{
			b->TransformPosition(BoneTransform[iSparkPos[i]],p,Position,true);
			for (int j = 0; j < iNumParticle; ++j)
				CreateParticle(BITMAP_CHROME_ENERGY2,Position,o->Angle,Light, 0, 0.3f);
		}

		for (int i = 18; i < 30; ++i)
		{
			b->TransformPosition(BoneTransform[iSparkPos[i]],p,Position,true);
			for (int j = 0; j < iNumParticle; ++j)
				CreateParticle(BITMAP_CHROME_ENERGY2,Position,o->Angle,Light, 0, 0.5f);
		}

		for (int i = 30; i < 38; ++i)
		{
			b->TransformPosition(BoneTransform[iSparkPos[i]],p,Position,true);
			for (int j = 0; j < iNumParticle; ++j)
				CreateParticle(BITMAP_CHROME_ENERGY2,Position,o->Angle,Light, 0, 0.7f);
		}
	}
	else if(Type == MODEL_WING+43)
	{
		vec3_t  p, Position, Light;
		Vector ( 0.f, 0.f, 0.f, p );
		float Scale = absf(sinf(WorldTime*0.002f))*0.2f;
		float Luminosity = absf(sinf(WorldTime*0.002f))*0.4f;

		Vector ( (1.0f + Luminosity)/2.f, (0.7f + Luminosity)/2.f, (0.2f + Luminosity)/2.f, Light );
		int iFlarePos0[] = { 7, 30, 31, 43, 8, 20 };

		int icnt;
		for (icnt = 0; icnt < 2; ++icnt)
		{
			b->TransformPosition(BoneTransform[iFlarePos0[icnt]],p,Position,true);
			CreateSprite(BITMAP_FLARE,Position,Scale+2.0f,Light,o);
		}
		Vector ( (1.0f + Luminosity)/4.f, (0.7f + Luminosity)/4.f, (0.2f + Luminosity)/4.f, Light );
		for (; icnt < 6; ++icnt)
		{
			b->TransformPosition(BoneTransform[iFlarePos0[icnt]],p,Position,true);
			CreateSprite(BITMAP_FLARE,Position,Scale+0.5f,Light,o);
		}

		Vector ( (0.5f + Luminosity)/2.f, (0.1f + Luminosity)/2.f, (0.4f + Luminosity)/2.f, Light );
		int iGreenFlarePos[] = { 29, 38, 42, 19, 15, 6 };

		for (int i = 0; i < 6; ++i)
		{
			b->TransformPosition(BoneTransform[iGreenFlarePos[i]],p,Position,true);
			CreateSprite(BITMAP_FLARE,Position,Scale+2.0f,Light,o);
		}
	}

	if(!o->EnableShadow)
	{
		float Luminosity = 1.f;

		if( g_isCharacterBuff(o, eBuff_Cloaking) )
        {
            Alpha = 0.5f;
			Vector ( 1.f, 1.f, 1.f, b->BodyLight );
      		b->RenderBody ( RENDER_BRIGHT|RENDER_CHROME5, Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU*8.f, o->BlendMeshTexCoordV*2.f, -1, BITMAP_CHROME2 );
        }
		else if( g_isCharacterBuff(o, eDeBuff_Poison) && g_isCharacterBuff(o, eDeBuff_Freeze) )
		{
			Vector(Luminosity*0.3f,Luminosity*1.f,Luminosity*1.f,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if(g_isCharacterBuff(o, eDeBuff_BlowOfDestruction))
		{
			Vector(Luminosity*0.3f,Luminosity*1.f,Luminosity*1.f,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if( g_isCharacterBuff(o, eDeBuff_Poison) )
		{
			Vector(Luminosity*0.3f,Luminosity*1.f,Luminosity*0.5f,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if( g_isCharacterBuff(o, eDeBuff_Stun) )
		{
			DeleteEffect(BITMAP_SKULL,o,5);
			CreateEffect(BITMAP_SKULL,o->Position,o->Angle,Light,5,o);
			Vector(Luminosity*0.f,Luminosity*0.f,Luminosity*1.0f,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if(g_isCharacterBuff(o, eDeBuff_Freeze))	
		{
			Vector(Luminosity*0.3f,Luminosity*0.5f,Luminosity*1.f,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if(g_isCharacterBuff(o, eDeBuff_BlowOfDestruction))
		{
			Vector(Luminosity*0.3f,Luminosity*0.5f,Luminosity*1.f,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if (g_isCharacterBuff(o, eDeBuff_Harden) )
        {
			Vector(Luminosity*0.3f,Luminosity*0.5f,Luminosity*1.f,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
        }
		else if(Level < 3 || o->Type == MODEL_POTION+15)
		{
			if( o->Type == MODEL_POTION+64 )
			{
				RenderPartObjectBody(b,o,Type,Alpha,RenderType);
				RenderPartObjectBodyColor2(b,o,Type,0.5f,RENDER_TEXTURE|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),0.5f);
	    		RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			}
			else if( o->Type == MODEL_HELPER+50 )
			{
				VectorCopy(Light,b->BodyLight);
				RenderPartObjectBody(b,o,Type,Alpha,RenderType);
				RenderPartObjectBodyColor2(b,o,Type,1.5f,RENDER_CHROME2|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.5f);
	    		RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			}
			else if( o->Type == MODEL_POTION+42 || o->Type ==  MODEL_HELPER+38 ) 
			{
				VectorCopy(Light,b->BodyLight);
				RenderPartObjectBody(b,o,Type,Alpha,RenderType);

				RenderPartObjectBodyColor2(b,o,Type,1.5f,RENDER_CHROME2|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.5f);
	    		RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			}
			else
			if( o->Type == MODEL_HELPER+43 || o->Type == MODEL_HELPER+93)
			{
				Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
				RenderPartObjectBody(b,o,Type,Alpha,RenderType);
				RenderPartObjectBodyColor2(b,o,Type,1.5f,RENDER_CHROME2|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.5f);
	    		RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			}
			else if( o->Type == MODEL_HELPER+44	|| o->Type == MODEL_HELPER+94 || o->Type == MODEL_HELPER+116)
			{
				Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
				RenderPartObjectBody(b,o,Type,Alpha,RenderType);
				RenderPartObjectBodyColor2(b,o,Type,1.5f,RENDER_CHROME2|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.5f);
	    		RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			}
			else if( o->Type == MODEL_HELPER+45 )
			{
				Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
				RenderPartObjectBody(b,o,Type,Alpha,RenderType);
				RenderPartObjectBodyColor2(b,o,Type,1.5f,RENDER_CHROME2|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.5f);
	    		RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			}	
			else
			{
				VectorCopy(Light,b->BodyLight);
				RenderPartObjectBody(b,o,Type,Alpha,RenderType);
			}    
		}
        else if(Level < 5)
		{
			vec3_t l;
			Vector(g_Luminosity,g_Luminosity*0.6f,g_Luminosity*0.6f,l);
			VectorMul(l,Light,b->BodyLight);
			RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if(Level < 7)
		{
			vec3_t l;
			Vector(g_Luminosity*0.5f,g_Luminosity*0.7f,g_Luminosity,l);
			VectorMul(l,Light,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
		}
		else if(g_pOption->GetRenderLevel())
        {
		    if(Level < 8 && g_pOption->GetRenderLevel() >= 1)  //  +7
		    {
			    Vector(Light[0]*0.8f,Light[1]*0.8f,Light[2]*0.8f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
			    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT,1.f);
		    }
		    else if(Level < 9 && g_pOption->GetRenderLevel() >= 1)  //  +8
		    {
			    Vector(Light[0]*0.8f,Light[1]*0.8f,Light[2]*0.8f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);	
			    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT,1.f);
		    }
            else if(Level < 10 && g_pOption->GetRenderLevel() >= 2) //  +9
            {
                Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
	    	    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_METAL|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
            }
		    else if(Level < 11 && g_pOption->GetRenderLevel() >= 2) //  +10
		    {
			    Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
	    	    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_METAL|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
		    }
            else if(Level < 12 && g_pOption->GetRenderLevel() >= 3) //  +11
            {
			    Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
	    	    RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME2|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_METAL|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
	    	    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
            }
            else if(Level < 13 && g_pOption->GetRenderLevel() >= 3) //  +12
            {
			    Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
	    	    RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME2|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_METAL|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
	    	    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
            }
            else if(Level < 14 && g_pOption->GetRenderLevel() >= 4) //  +13
            {
			    Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
                RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
			    RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_METAL|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
				RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
            }
            else if(Level < 15 && g_pOption->GetRenderLevel() >= 4) //  +14
            {
				Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
                RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
				RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_METAL|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
				RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
            }
            else if(Level < 16 && g_pOption->GetRenderLevel() >= 4) //  +15
            {
				Vector(Light[0]*0.9f,Light[1]*0.9f,Light[2]*0.9f,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
                RenderPartObjectBodyColor2(b,o,Type,1.f,RENDER_CHROME4|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
				RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_METAL|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
				RenderPartObjectBodyColor(b,o,Type,Alpha,RENDER_CHROME|RENDER_BRIGHT|(RenderType&RENDER_EXTRA),1.f);
            }
            else
            {
				VectorCopy(Light,b->BodyLight);
                RenderPartObjectBody(b,o,Type,Alpha,RenderType);
            }
        }
        else
        {
			VectorCopy(Light,b->BodyLight);
            RenderPartObjectBody(b,o,Type,Alpha,RenderType);
        }


		if(g_pOption->GetRenderLevel() == 0) 
		{
			return;
		}
        
        if ( !g_isCharacterBuff(o, eDeBuff_Harden) && !g_isCharacterBuff(o, eBuff_Cloaking) 
		  && !g_isCharacterBuff(o, eDeBuff_CursedTempleRestraint)
		   )
        {
		    if ( (Option1&63)>0 && ( o->Type<MODEL_WING || o->Type>MODEL_WING+6 ) && o->Type!=MODEL_HELPER+30
				&& (o->Type<MODEL_WING+36 || o->Type>MODEL_WING+43)
				&& ( o->Type < MODEL_WING+130 || MODEL_WING+134 < o->Type )
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
				&& !(o->Type>=MODEL_WING+49 && o->Type<=MODEL_WING+50)
				&& (o->Type!=MODEL_WING+135)
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
				)
		    {
				Luminosity = sinf(WorldTime*0.002f)*0.5f+0.5f;
				Vector(Luminosity,Luminosity*0.3f,1.f-Luminosity,b->BodyLight);
				Alpha = 1.f;
				if (b->HideSkin && MODEL_HELM+39 <= o->Type && MODEL_HELM+44 >= o->Type)
				{
					int anMesh[6] = { 2, 1, 0, 2, 1, 2 };
					b->RenderMesh(anMesh[o->Type-(MODEL_HELM+39)], RENDER_TEXTURE|RENDER_BRIGHT, Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV);
				}
#ifdef PBG_ADD_NEWCHAR_MONK_ITEM
				else if(Type == MODEL_HELM+59 || Type == MODEL_HELM+60)
				{
					b->RenderMesh(1, RENDER_TEXTURE|RENDER_BRIGHT, Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV);
				}
				else if(Type == MODEL_HELM+61)
				{
					b->RenderMesh(0, RENDER_TEXTURE|RENDER_BRIGHT, Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV);
				}
				else if(Type == MODEL_ARMOR+59)
				{
					b->RenderMesh(1, RENDER_TEXTURE|RENDER_BRIGHT, Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV);
				}
				else if(Type == MODEL_ARMOR+60)
				{
					b->RenderMesh(1, RENDER_TEXTURE|RENDER_BRIGHT, Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV);
				}
				else if(Type == MODEL_ARMOR+61)
				{
					b->RenderMesh(0, RENDER_TEXTURE|RENDER_BRIGHT, Alpha, o->BlendMesh, o->BlendMeshLight, o->BlendMeshTexCoordU, o->BlendMeshTexCoordV);
				}
#endif //PBG_ADD_NEWCHAR_MONK_ITEM
				else
				{
					b->RenderBody(RENDER_TEXTURE|RENDER_BRIGHT,Alpha,o->BlendMesh,o->BlendMeshLight,o->BlendMeshTexCoordU,o->BlendMeshTexCoordV);
				}
		    }
            else if ( ((ExtOption%0x04)==EXT_A_SET_OPTION || (ExtOption%0x04)==EXT_B_SET_OPTION ))
            {
			    Alpha = sinf(WorldTime*0.001f)*0.5f+0.4f;
                if ( Alpha<=0.01f )
                {
                    b->renderCount = rand()%100;
                }
    	    	RenderPartObjectBodyColor2(b,o,Type,Alpha,RENDER_CHROME3|RENDER_BRIGHT,1.f);
            }
        }
	}
#ifndef CAMERA_TEST
	else
	{
		if(gMapManager.WorldActive == 7)
		{
			EnableAlphaTest();
			glColor4f(0.f,0.f,0.f,0.2f);
		}
		else
		{
			DisableAlphaBlend();
			glColor3f(0.f,0.f,0.f);
		}
        bool bRenderShadow = true;

        if ( gMapManager.InHellas() )
        {
            bRenderShadow = false;
        }

		if ( WD_10HEAVEN == gMapManager.WorldActive || o->m_bySkillCount==3 || g_Direction.m_CKanturu.IsMayaScene() )
        {
            bRenderShadow = false;
        }

		if( g_isCharacterBuff(o, eBuff_Cloaking ) )
        {
            bRenderShadow = false;
        }

        if ( bRenderShadow )
		{
            bRenderShadow = o->m_bRenderShadow;
            if ( bRenderShadow )
		    {
                b->RenderBodyShadow(o->BlendMesh,o->HiddenMesh);
            }
		}
#endif
	}

}

#endif // end RenderPartObjectEffect extract

// End of reference file.
